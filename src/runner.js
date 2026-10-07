'use strict';
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { matches, fingerprint } = require('./learning');
const { windowsCodePage, decodeConsoleBytes } = require('./console-encoding');

const ignored = new Set(['bin', 'obj', '.git', '.aimlearning-build', 'node_modules', '__pycache__', '.venv', 'venv', '.pytest_cache', '.mypy_cache']);
function entryFilename(track) {
  const names = { csharp: 'Program.cs', cpp: 'main.cpp', python: 'main.py', javascript: 'app.js' };
  if (!names[track]) throw new Error('Esta ruta no tiene un proyecto ejecutable.');
  return names[track];
}
function runtimeFor(track, config = {}) {
  if (track === 'csharp') return config.dotnetPath || 'dotnet';
  if (track === 'cpp') return config.cppCompiler || 'g++';
  if (track === 'python') return config.pythonPath || (process.platform === 'win32' ? 'python' : 'python3');
  if (track === 'javascript') return config.nodePath || 'node';
  throw new Error('Ruta no ejecutable.');
}
async function sourceFiles(root) {
  const result = [];
  async function walk(dir) {
    for (const entry of (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (ignored.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && /\.(cs|csproj|cpp|cc|cxx|h|hpp|props|targets|json|py|js)$/i.test(entry.name)) {
        result.push(full);
        if (result.length > 200) throw new Error('El proyecto supera los 200 archivos que puede revisar esta versión.');
      }
    }
  }
  await walk(root);
  return result;
}
async function snapshot(root) {
  const files = await sourceFiles(root);
  let content = '';
  for (const file of files) {
    const stat = await fs.stat(file);
    if (stat.size > 256 * 1024) throw new Error('Un archivo del proyecto supera los 256 KB de esta versión.');
    content += `\n--- ${path.relative(root, file)} ---\n${await fs.readFile(file, 'utf8')}`;
    if (content.length > 1024 * 1024) throw new Error('El proyecto supera el tamaño de revisión de esta versión.');
  }
  return { hash: fingerprint(content), content, files };
}
function terminate(child) {
  if (!child.pid) return;
  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    killer.on('error', () => child.kill());
  } else {
    try { process.kill(-child.pid, 'SIGKILL'); } catch { child.kill('SIGKILL'); }
  }
}
function execute(command, args, { cwd, input = '', timeout = 10000, signal, onData = () => {} } = {}) {
  return new Promise((resolve) => {
    let output = '', stderr = '', size = 0, reason = null;
    const stdoutChunks = [], stderrChunks = [];
    const codePage = windowsCodePage();
    let child;
    if (signal?.aborted) return resolve({ code: -1, output, stderr: 'Comprobación cancelada.', cancelled: true });
    try { child = spawn(command, args, { cwd, shell: false, windowsHide: true, detached: process.platform !== 'win32', env: { ...process.env, DOTNET_NOLOGO: '1', DOTNET_CLI_TELEMETRY_OPTOUT: '1' } }); }
    catch (error) { return resolve({ code: -1, output, stderr: error.message }); }
    const stop = (why) => { if (!reason) { reason = why; terminate(child); } };
    const abort = () => stop('cancelled');
    signal?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(() => stop('timeout'), timeout);
    const collect = (data, isError) => {
      size += data.length;
      if (size > 512 * 1024) return stop('outputLimit');
      if (isError) stderrChunks.push(data); else stdoutChunks.push(data);
      onData(decodeConsoleBytes(data, codePage));
    };
    child.stdout.on('data', data => collect(data, false));
    child.stderr.on('data', data => collect(data, true));
    child.stdin.on('error', () => {});
    child.stdin.end(input);
    child.on('error', error => { const message = error.code === 'ENOENT' ? `No se encontró ${command}. Instala la herramienta o configura su ruta en AImlearning.` : error.message; stderr += message; onData(message + '\n'); });
    child.on('close', code => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      output = decodeConsoleBytes(Buffer.concat(stdoutChunks), codePage);
      stderr = decodeConsoleBytes(Buffer.concat(stderrChunks), codePage) + stderr;
      if (reason === 'timeout') stderr += '\nSe agotó el tiempo. ¿El programa espera más entradas o no termina su ciclo?';
      if (reason === 'outputLimit') stderr += '\nLa salida excedió el límite. Comprueba si el programa imprime sin terminar.';
      resolve({ code: reason ? -1 : (code ?? -1), output, stderr, cancelled: reason === 'cancelled', reason });
    });
  });
}
async function verify(mission, root, config, { log = () => {}, signal } = {}) {
  const before = await snapshot(root);
  const buildDir = path.join(root, '.aimlearning-build');
  const interpreted = mission.track === 'python' || mission.track === 'javascript';
  if (!interpreted) await fs.mkdir(buildDir, { recursive: true });
  const binary = path.join(buildDir, process.platform === 'win32' ? 'analizador.exe' : 'analizador');
  const command = runtimeFor(mission.track, config);
  const entry = path.join(root, entryFilename(mission.track));
  const args = mission.track === 'csharp' ? ['build', path.join(root, 'AImlearningApp.csproj'), '--nologo', '--output', buildDir]
    : mission.track === 'cpp' ? ['-std=c++17', '-Wall', '-Wextra', ...before.files.filter(f => /\.(cpp|cc|cxx)$/.test(f)), '-o', binary]
    : mission.track === 'python' ? ['-m', 'py_compile', entry] : ['--check', entry];
  log(`AImlearning · ${mission.title}\n\n${interpreted ? 'Revisando sintaxis' : 'Compilando'} con ${command}…\n`);
  const build = await execute(command, args, { cwd: root, timeout: 120000, signal, onData: log });
  if (build.code !== 0) return { passed: false, phase: 'build', hash: before.hash, summary: build.cancelled ? 'Comprobación cancelada.' : interpreted ? 'La sintaxis necesita atención. Revisa el primer error en la terminal.' : 'La compilación necesita atención. Revisa el primer error en la terminal.', details: (build.stderr || build.output).slice(-6000), cases: [] };
  const cases = [];
  for (const test of mission.tests) {
    if (signal?.aborted) break;
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'aimlearning-'));
    let pass = true, detail = '';
    try {
      for (const step of (test.steps || [test])) {
        const runArgs = mission.track === 'csharp' ? [path.join(buildDir, 'AImlearningApp.dll'), ...(step.args || [])]
          : interpreted ? [entry, ...(step.args || [])] : (step.args || []);
        const run = await execute(interpreted || mission.track === 'csharp' ? command : binary, runArgs, { cwd: temp, input: step.input || '', timeout: 5000, signal });
        if (run.code !== 0 || !matches(run.output, step.expected, test.unordered)) {
          pass = false;
          detail = run.code !== 0 ? (run.stderr || `El proceso terminó con código ${run.code}.`) : `La salida no coincide con el contrato. Recibido: ${JSON.stringify(run.output.slice(0, 300))}`;
          break;
        }
      }
    } finally { await fs.rm(temp, { recursive: true, force: true }).catch(() => {}); }
    cases.push({ name: test.name, passed: pass, detail });
    log(`${pass ? 'OK' : 'REVISAR'} · ${test.name}${detail ? '\n' + detail : ''}\n`);
  }
  const after = await snapshot(root);
  const changed = before.hash !== after.hash;
  const passed = !changed && cases.length === mission.tests.length && cases.every(c => c.passed) && !signal?.aborted;
  const summary = changed ? 'El código cambió durante la comprobación. Guarda y comprueba otra vez.' : signal?.aborted ? 'Comprobación cancelada.' : passed ? 'Superaste los casos de esta misión. Ahora explica cómo razonaste.' : 'Hay un caso para investigar. Usa la terminal y pide una orientación si la necesitas.';
  log(`\n${summary}\n`);
  return { passed, phase: 'tests', hash: before.hash, cases, summary, checkedAt: new Date().toISOString() };
}
function quote(value, shell) {
  if (shell === 'cmd') {
    if (/["%\r\n!]/.test(value)) throw new Error('Esta ruta requiere PowerShell o una terminal abierta manualmente en la carpeta.');
    return `"${value}"`;
  }
  if (shell === 'powershell') return `'${value.replace(/'/g, "''")}'`;
  return `'${value.replace(/'/g, "'\\''")}'`;
}
function commandGuide(mission, root, shell, config) {
  const call = (exe, args) => `${shell === 'powershell' ? '& ' : ''}${quote(exe, shell)} ${args.map(a => quote(a, shell)).join(' ')}`;
  const cd = `${shell === 'powershell' ? 'Set-Location -LiteralPath' : shell === 'cmd' ? 'cd /d' : 'cd --'} ${quote(root, shell)}`;
  const tool = runtimeFor(mission.track, config);
  const binary = process.platform === 'win32' ? '.\\analizador.exe' : './analizador';
  const entry = entryFilename(mission.track);
  const syntax = mission.track === 'csharp' ? call(tool, ['build'])
    : mission.track === 'cpp' ? call(tool, ['-std=c++17', '-Wall', '-Wextra', entry, '-o', 'analizador'])
    : mission.track === 'python' ? call(tool, ['-m', 'py_compile', entry]) : call(tool, ['--check', entry]);
  const csharpCommand = { 'cs-save': 'total', 'cs-validate': 'total', 'cs-report': 'resumen', 'cs-limit': 'estado' }[mission.id];
  const cppCommand = mission.id === 'cpp-save' ? 'resumen' : null;
  const run = mission.track === 'csharp' ? call(tool, ['run', ...(csharpCommand ? ['--', csharpCommand] : [])])
    : mission.track === 'cpp' ? call(binary, cppCommand ? [cppCommand] : [])
    : call(tool, [entry, ...(mission.id === 'py-history' ? ['total'] : mission.id === 'js-save' ? ['listar'] : [])]);
  return [
    { title: 'Ubícate en el proyecto', command: cd, why: 'La terminal trabaja desde una carpeta. Este comando cambia a la carpeta de tu misión.' },
    { title: 'Comprueba la herramienta', command: call(tool, ['--version']), why: 'Esto consulta la versión instalada; todavía no ejecuta tu programa.' },
    { title: mission.track === 'python' || mission.track === 'javascript' ? 'Revisa la sintaxis' : 'Compila tu intento', command: syntax, why: mission.track === 'cpp' ? 'Lee el primer error antes de cambiar el código. Añade tus otros archivos fuente si dividiste el programa.' : 'Lee el primer error antes de cambiar el código. Si no aparece nada, continúa con la ejecución.' },
    { title: 'Ejecuta y observa', command: run, why: csharpCommand ? 'Prueba también agregar Categoria Importe; en la misión de presupuesto usa limite Importe. Los datos quedan en esta carpeta.' : cppCommand ? 'Prueba también agregar VALOR. Los datos quedan en esta carpeta entre ejecuciones.' : mission.id === 'py-history' ? 'Prueba registrar MINUTOS e historial. Los datos quedan en esta carpeta.' : mission.id === 'js-save' ? 'Prueba agregar NOMBRE y completar INDICE. Los datos quedan en esta carpeta.' : 'Si el reto pide datos, escríbelos uno por uno y pulsa Enter. Antes de hacerlo, predice la salida.' }
  ];
}
module.exports = { entryFilename, runtimeFor, sourceFiles, snapshot, execute, verify, commandGuide, quote };
