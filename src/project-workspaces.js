'use strict';
const i18n = require('./i18n');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { execute, quote } = require('./runner');
const projectBehavior = require('./project-behavior');

const sharedIgnore = 'bin/\nobj/\nbuild/\n*.db\n*.sqlite\n*.sqlite3\n.vs/\n';

function starterFiles(project, sdkMajor = 8) {
  const common = { '.gitignore': sharedIgnore };
  switch (project.id) {
    case 'project-cs-gui': return {
      ...common,
      'GastosEscritorio.csproj': `<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>WinExe</OutputType><TargetFramework>net${sdkMajor}.0-windows</TargetFramework><UseWindowsForms>true</UseWindowsForms><Nullable>enable</Nullable><ImplicitUsings>enable</ImplicitUsings></PropertyGroup></Project>\n`,
      'Program.cs': 'using System.Windows.Forms;\n\nApplicationConfiguration.Initialize();\nApplication.Run(new Form { Text = "Control de gastos", Width = 720, Height = 480 });\n// Prepara aquí la interfaz y separa su lógica de los controles.\n'
    };
    case 'project-cs-db': return {
      ...common,
      'InventarioApi.csproj': `<Project Sdk="Microsoft.NET.Sdk.Web"><PropertyGroup><TargetFramework>net${sdkMajor}.0</TargetFramework><Nullable>enable</Nullable><ImplicitUsings>enable</ImplicitUsings></PropertyGroup></Project>\n`,
      'Program.cs': 'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\napp.MapGet("/health", () => Results.Ok(new { status = "ready" }));\n// Añade aquí tus rutas de inventario y tu capa de datos.\napp.Run();\n',
      'tests/README.md': 'Crea aquí un proyecto .NET de pruebas. Comprueba operación válida, entrada inválida y persistencia tras reiniciar. Decide cómo aislar la base de datos de cada prueba; no uses datos personales.\n'
    };
    case 'project-cs-github': return {
      ...common,
      'IncidenciasApi.csproj': `<Project Sdk="Microsoft.NET.Sdk.Web"><PropertyGroup><TargetFramework>net${sdkMajor}.0</TargetFramework><Nullable>enable</Nullable><ImplicitUsings>enable</ImplicitUsings></PropertyGroup></Project>\n`,
      'Program.cs': 'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\napp.MapGet("/health", () => Results.Ok(new { status = "ready" }));\n// Diseña aquí la API de incidencias y sus pruebas.\napp.Run();\n',
      'tests/README.md': 'Crea aquí un proyecto .NET de pruebas. Comprueba crear y consultar, cambios de estado y casos de frontera. Las pruebas deben fallar si el comportamiento cambia.\n',
      'README.md': '# Servicio de incidencias\n\nExplica aquí el problema, cómo iniciar la API y cómo ejecutar tus pruebas.\n'
    };
    case 'project-cpp-gui': return {
      ...common,
      'CMakeLists.txt': 'cmake_minimum_required(VERSION 3.16)\nproject(MonitorMediciones LANGUAGES CXX)\nset(CMAKE_CXX_STANDARD 17)\nset(CMAKE_CXX_STANDARD_REQUIRED ON)\nfind_package(Qt6 REQUIRED COMPONENTS Widgets)\nadd_executable(monitor main.cpp)\ntarget_link_libraries(monitor PRIVATE Qt6::Widgets)\n',
      'main.cpp': '#include <QApplication>\n#include <QWidget>\n\nint main(int argc, char* argv[]) {\n    QApplication app(argc, argv);\n    QWidget window;\n    window.setWindowTitle("Monitor de mediciones");\n    window.resize(720, 480);\n    window.show();\n    // Añade controles, eventos y análisis sin mezclar todas las responsabilidades.\n    return app.exec();\n}\n'
    };
    case 'project-cpp-db': return {
      ...common,
      'CMakeLists.txt': 'cmake_minimum_required(VERSION 3.16)\nproject(CatalogoPiezas LANGUAGES CXX)\nset(CMAKE_CXX_STANDARD 17)\nset(CMAKE_CXX_STANDARD_REQUIRED ON)\nfind_package(SQLite3 REQUIRED)\nadd_executable(catalogo main.cpp)\ntarget_link_libraries(catalogo PRIVATE SQLite::SQLite3)\nenable_testing()\n# Añade aquí pruebas que cubran operaciones, errores y persistencia.\n',
      'main.cpp': '#include <sqlite3.h>\n#include <iostream>\n\nint main(int argc, char* argv[]) {\n    // Decide qué comando recibiste y qué operación de SQLite corresponde.\n    std::cout << "Catálogo en preparación\\n";\n    return 0;\n}\n',
      'tests/README.md': 'Añade casos CTest para registrar y consultar, rechazar entradas inválidas y comprobar persistencia entre procesos. Usa una base temporal distinta por caso.\n'
    };
    case 'project-cpp-github': return {
      ...common,
      'CMakeLists.txt': 'cmake_minimum_required(VERSION 3.16)\nproject(BibliotecaAnalisis LANGUAGES CXX)\nset(CMAKE_CXX_STANDARD 17)\nset(CMAKE_CXX_STANDARD_REQUIRED ON)\nadd_library(analisis STATIC src/analysis.cpp)\ntarget_include_directories(analisis PUBLIC include)\nenable_testing()\n# Registra aquí un ejecutable de pruebas que use la API pública.\n',
      'include/analysis.hpp': '#pragma once\n\n// Declara aquí la API pública para analizar series.\n',
      'src/analysis.cpp': '#include "analysis.hpp"\n\n// Implementa aquí las operaciones de la biblioteca.\n',
      'tests/README.md': 'Crea aquí pruebas que llamen a la API pública y regístralas con CTest.\n',
      'README.md': '# Biblioteca de análisis\n\nExplica aquí la API pública, la compilación y las pruebas.\n'
    };
    default: throw new Error('Proyecto desconocido.');
  }
}

function challengeFile(project, language = 'es') {
  const tr = value => i18n.text(value, language);
  return '# ' + project.title + '\n\n' + project.brief + tr('\n\n## Qué construir\n\n')
    + project.deliverables.map(item => '- ' + item).join('\n')
    + tr('\n\n## Etapas de trabajo\n\n')
    + project.milestones.map((item, index) => `${index + 1}. **${item.title}.** ${item.prompt}`).join('\n')
    + tr('\n\n## Herramientas\n\n') + project.environment
    + tr('\n\n## Comprobaciones de comportamiento\n\n')
    + i18n.content(projectBehavior.expectedCases(project), language).map((item, index) => `${index + 1}. **${item.name}.** ${item.prompt}`).join('\n')
    + (project.kind === 'gui'
      ? tr('\n\nEjecuta estos tres casos en la ventana y anota en Revisión qué observaste. La extensión registra tu evidencia, pero no automatiza la interfaz.')
      : tr('\n\nEscribe al menos tres pruebas propias en tests/ que cubran estos casos. AImlearning ejecutará dotnet test o CTest; no infiere la cobertura a partir de sus nombres.'))
    + tr('\n\nLa extensión crea solo la estructura inicial. Decide e implementa el comportamiento. Guarda en AImlearning las pruebas que hiciste y qué aprendiste.\n');
}

async function create(project, root, sdkMajor = 8, language = 'es') {
  await fs.mkdir(root, { recursive: true });
  const files = { ...starterFiles(project, sdkMajor), 'RETO.md': challengeFile(project, language) };
  for (const [relative, content] of Object.entries(files)) {
    const destination = path.join(root, relative);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    try { await fs.writeFile(destination, relative.endsWith('.md') && relative !== 'RETO.md' ? i18n.text(content, language) : content, { flag: 'wx' }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
  return root;
}

const ignored = new Set(['.git', 'bin', 'obj', 'build', '.vs', 'node_modules']);
async function sourceSnapshot(root) {
  const parts = [];
  async function walk(dir) {
    for (const entry of (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (ignored.has(entry.name)) continue;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile() && (/\.(cs|csproj|cpp|cc|cxx|h|hpp|cmake|yml|yaml|resx|ui|qrc|sql)$/i.test(entry.name) || entry.name === 'CMakeLists.txt')) {
        const stat = await fs.stat(file);
        if (stat.size > 256 * 1024) throw new Error('Un archivo supera el límite de revisión de 256 KB.');
        parts.push(path.relative(root, file) + '\n' + await fs.readFile(file, 'utf8'));
        if (parts.length > 200) throw new Error('El proyecto supera 200 archivos revisables.');
      }
    }
  }
  await walk(root);
  return crypto.createHash('sha256').update(parts.join('\n---\n')).digest('hex');
}

function commands(project, root, shell, tools = {}) {
  const call = (exe, args) => `${shell === 'powershell' ? '& ' : ''}${quote(exe, shell)}${args.map(arg => ' ' + quote(arg, shell)).join('')}`;
  const cd = `${shell === 'powershell' ? 'Set-Location -LiteralPath' : shell === 'cmd' ? 'cd /d' : 'cd --'} ${quote(root, shell)}`;
  const dotnet = tools.dotnetPath || 'dotnet', cmake = tools.cmakePath || 'cmake';
  const steps = [{ title: 'Entra en el proyecto', command: cd, why: 'Los comandos y archivos relativos usan esta carpeta.' }];
  if (project.track === 'csharp') {
    steps.push({ title: 'Comprueba .NET', command: call(dotnet, ['--version']), why: 'Confirma que el SDK está disponible.' });
    if (project.id === 'project-cs-db') steps.push({ title: 'Prepara SQLite', command: call(dotnet, ['add', 'package', 'Microsoft.Data.Sqlite']), why: 'Añade el proveedor SQLite cuando vayas a implementar la capa de datos. Requiere restaurar el paquete.' });
    steps.push({ title: 'Compila', command: call(dotnet, ['build']), why: 'Lee el primer error antes de ejecutar.' });
    if (project.kind !== 'gui') {
      const testProject = 'tests/Pruebas/Pruebas.csproj';
      steps.push({ title: 'Prepara pruebas', command: call(dotnet, ['new', 'xunit', '-o', 'tests/Pruebas']), why: 'Ejecuta una sola vez para crear un proyecto de pruebas. Puede requerir restaurar paquetes; no contiene pruebas del comportamiento de tu API.' });
      steps.push({ title: 'Vincula tu proyecto', command: call(dotnet, ['add', testProject, 'reference', project.kind === 'database' ? 'InventarioApi.csproj' : 'IncidenciasApi.csproj']), why: 'Permite que tus pruebas usen las piezas comprobables que decidas extraer de la API.' });
      steps.push({ title: 'Prueba comportamiento', command: call(dotnet, ['test', testProject]), why: 'Escribe al menos tres pruebas propias que cubran los casos del reto; la plantilla sola no basta.' });
    }
    steps.push({ title: 'Ejecuta', command: call(dotnet, ['run']), why: project.kind === 'gui' ? 'Abre la ventana y prueba cada interacción manualmente.' : 'Inicia la API; detén el servidor con Ctrl+C al terminar las pruebas.' });
  } else {
    steps.push({ title: 'Configura CMake', command: call(cmake, ['-S', '.', '-B', 'build']), why: project.kind === 'gui' ? 'CMake debe encontrar Qt 6 Widgets. Si no lo encuentra, configura CMAKE_PREFIX_PATH según tu instalación.' : project.kind === 'database' ? 'CMake debe encontrar SQLite3 y sus encabezados.' : 'Prepara la biblioteca y los futuros tests.' });
    steps.push({ title: 'Compila', command: call(cmake, ['--build', 'build']), why: 'CMake ejecuta el compilador con las dependencias declaradas.' });
    if (project.kind === 'github' || project.kind === 'database') steps.push({ title: 'Ejecuta las pruebas', command: call(tools.ctestPath || 'ctest', ['--test-dir', 'build', '--output-on-failure']), why: 'Registra primero al menos tres casos en CTest; compilar no comprueba el comportamiento.' });
    if (project.kind !== 'github') steps.push({ title: 'Ejecuta', command: call(process.platform === 'win32' ? '.\\build\\' + (project.kind === 'gui' ? 'monitor.exe' : 'catalogo.exe') : './build/' + (project.kind === 'gui' ? 'monitor' : 'catalogo'), []), why: project.kind === 'gui' ? 'Abre la ventana y prueba las interacciones.' : 'Prueba comandos y persistencia desde esta carpeta.' });
  }
  if (project.kind === 'github') {
    steps.push({ title: 'Inicia Git', command: call(tools.gitPath || 'git', ['init']), why: 'Crea el repositorio local; hazlo tú después de revisar qué archivos vas a seguir.' });
    steps.push({ title: 'Revisa cambios', command: call(tools.gitPath || 'git', ['status']), why: 'Comprueba que no se incluyan binarios, secretos ni bases de datos.' });
  }
  return steps;
}

async function verifyBuild(project, root, tools = {}, log = () => {}, signal) {
  const hash = await sourceSnapshot(root);
  const isCs = project.track === 'csharp';
  const stages = isCs
    ? [[tools.dotnetPath || 'dotnet', ['build', '--nologo']]]
    : [[tools.cmakePath || 'cmake', ['-S', '.', '-B', 'build']], [tools.cmakePath || 'cmake', ['--build', 'build']]];
  for (const [command, args] of stages) {
    log(`${command} ${args.join(' ')}\n`);
    const result = await execute(command, args, { cwd: root, timeout: 120000, onData: log, signal });
    if (result.code !== 0) return { passed: false, hash, summary: 'La compilación necesita atención. Revisa el primer error de la terminal.', details: (result.stderr || result.output).slice(-4000) };
  }
  const after = await sourceSnapshot(root);
  if (hash !== after) return { passed: false, hash: after, summary: 'El código cambió durante la compilación. Guarda y comprueba otra vez.' };
  return { passed: true, hash, summary: 'El proyecto compila. Prueba manualmente su comportamiento y registra tus resultados; compilar no demuestra que todos los requisitos funcionen.', checkedAt: new Date().toISOString() };
}

async function inspectGitHub(project, root, pullRequestUrl, tools = {}, signal, behavior) {
  if (project.kind !== 'github') return { passed: true, findings: [] };
  const findings = [];
  const git = async args => execute(tools.gitPath || 'git', ['-C', root, ...args], { cwd: root, timeout: 10000, signal });
  const commit = await git(['rev-parse', '--verify', 'HEAD']);
  if (commit.code !== 0) findings.push('Crea al menos un commit en este proyecto.');
  const remote = await git(['remote', 'get-url', 'origin']);
  const remoteUrl = remote.output.trim();
  const remoteMatch = remote.code === 0 && /(?:github\.com[:/])([^/\s]+)\/([^/\s]+?)(?:\.git)?$/i.exec(remoteUrl);
  if (!remoteMatch) findings.push('Configura origin con la dirección de tu repositorio en github.com.');
  const workflowDir = path.join(root, '.github', 'workflows');
  const workflows = await fs.readdir(workflowDir).catch(() => []);
  const workflowFiles = workflows.filter(name => /\.ya?ml$/i.test(name));
  if (!workflowFiles.length) findings.push('Añade un workflow YAML en .github/workflows/.');
  else {
    const content = (await Promise.all(workflowFiles.map(name => fs.readFile(path.join(workflowDir, name), 'utf8')))).join('\n');
    if (!/^\s*["']?on["']?\s*:/m.test(content) || !/^\s*jobs\s*:/m.test(content) || !(project.track === 'csharp' ? /dotnet\s+test/i : /ctest/i).test(content)) {
      findings.push('El workflow debe ejecutarse en un evento y contener un trabajo que ejecute las pruebas.');
    }
  }
  const readme = await fs.readFile(path.join(root, 'README.md'), 'utf8').catch(() => '');
  if (readme.length < 180 || /Explica aquí/.test(readme)) findings.push('Completa el README con instrucciones reproducibles.');
  const testRoot = path.join(root, 'tests');
  const testFiles = await fs.readdir(testRoot, { recursive: true }).catch(() => []);
  if (!testFiles.some(name => project.track === 'csharp' ? /\.cs$/i.test(name) : /\.(cpp|cc|cxx)$/i.test(name))) findings.push('Añade pruebas propias en tests/.');
  if (behavior) {
    if (!behavior.passed) findings.push('Supera al menos tres pruebas automáticas de comportamiento antes de completar el proyecto.');
  } else if (project.track === 'csharp') {
    const testProject = testFiles.find(name => /\.csproj$/i.test(name));
    if (!testProject) findings.push('Crea un proyecto de pruebas dentro de tests/.');
    else {
      const run = await execute(tools.dotnetPath || 'dotnet', ['test', path.join(testRoot, testProject), '--nologo'], { cwd: root, timeout: 120000, signal });
      if (run.code !== 0 || !/(?:Passed|Correcto)\s*:\s*[1-9]\d*|Test Run Successful/i.test(run.output + run.stderr)) findings.push('Ejecuta y supera al menos una prueba de .NET antes de completar el proyecto.');
    }
  } else {
    const listed = await execute(tools.ctestPath || 'ctest', ['--test-dir', path.join(root, 'build'), '-N'], { cwd: root, timeout: 15000, signal });
    const count = Number(/Total Tests:\s*(\d+)/i.exec(listed.output)?.[1] || 0);
    if (listed.code !== 0 || count === 0) findings.push('Registra al menos una prueba real en CTest.');
    else {
      const run = await execute(tools.ctestPath || 'ctest', ['--test-dir', path.join(root, 'build'), '--output-on-failure'], { cwd: root, timeout: 120000, signal });
      if (run.code !== 0) findings.push('Las pruebas CTest deben pasar antes de completar el proyecto.');
    }
  }
  let prMatch;
  try {
    const url = new URL(String(pullRequestUrl || ''));
    prMatch = url.protocol === 'https:' && url.hostname === 'github.com' && /^\/[^/]+\/[^/]+\/pull\/\d+\/?$/.test(url.pathname);
    if (prMatch && remoteMatch) {
      const [, owner, repo] = remoteMatch;
      const [urlOwner, urlRepo] = url.pathname.split('/').filter(Boolean);
      if (owner.toLowerCase() !== urlOwner.toLowerCase() || repo.replace(/\.git$/i, '').toLowerCase() !== urlRepo.toLowerCase()) prMatch = false;
    }
  } catch { prMatch = false; }
  if (!prMatch) findings.push('Registra el enlace HTTPS del pull request del mismo repositorio.');
  return { passed: findings.length === 0, findings, remoteUrl, note: 'Se revisaron archivos y Git locales. AImlearning no comprueba el estado remoto del pull request ni de GitHub Actions.' };
}

module.exports = { starterFiles, challengeFile, create, sourceSnapshot, commands, verifyBuild, inspectGitHub };
