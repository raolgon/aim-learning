'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { missions } = require('../src/catalog');
const L = require('../src/learning');
const R = require('../src/runner');
const foundations = missions.filter(m => m.track === 'foundations');
const csharp = missions.find(m => m.id === 'cs-welcome');
const unlockLanguages = state => { for (const m of foundations) state.records[m.id] = { completedAt: 'now' }; };

test('los fundamentos son previos a los cuatro lenguajes; avanzar requiere la misión anterior', () => {
  const s = L.freshState();
  assert.equal(s.selected, foundations[0].id);
  assert.equal(L.unlocked(s, foundations[0]), true);
  assert.equal(L.unlocked(s, foundations[1]), false);
  assert.equal(L.unlocked(s, csharp), false);
  assert.equal(L.unlocked(s, missions.find(m => m.id === 'cpp-welcome')), false);
  assert.equal(L.unlocked(s, missions.find(m => m.id === 'py-welcome')), false);
  assert.equal(L.unlocked(s, missions.find(m => m.id === 'js-welcome')), false);
  s.records[foundations[0].id] = { completedAt: 'now' };
  assert.equal(L.unlocked(s, foundations[1]), true);
  assert.equal(L.unlocked(s, foundations[2]), false);
  unlockLanguages(s);
  assert.equal(L.foundationsComplete(s), true);
  assert.equal(L.unlocked(s, csharp), true);
  assert.equal(L.unlocked(s, missions.find(m => m.id === 'cpp-welcome')), true);
  assert.equal(L.unlocked(s, missions.find(m => m.id === 'py-welcome')), true);
  assert.equal(L.unlocked(s, missions.find(m => m.id === 'js-welcome')), true);
});
test('las bases compartidas siguen al alumno entre carpetas sin copiar el avance de código', () => {
  const oldWorkspace = { ...L.freshState(), track: 'csharp', selected: 'cs-welcome', records: { 'cs-welcome': { completedAt: 'ayer' } } };
  const redirected = L.initialState(oldWorkspace);
  assert.equal(redirected.selected, 'base-contract');
  assert.equal(redirected.records['cs-welcome'].completedAt, 'ayer');
  const shared = Object.fromEntries(foundations.map(m => [m.id, { completedAt: 'hoy' }]));
  const nextWorkspace = L.initialState(undefined, shared);
  assert.equal(nextWorkspace.selected, 'cs-welcome');
  assert.equal(nextWorkspace.records['cs-welcome'], undefined);
  assert.equal(L.foundationsComplete(nextWorkspace), true);
  const existing = L.initialState(oldWorkspace, shared);
  assert.equal(existing.selected, 'cs-welcome');
  assert.equal(existing.records['cs-welcome'].completedAt, 'ayer');
});
test('completar exige intento, pruebas vigentes y reflexión; no duplica XP', () => {
  const s = L.freshState(), m = csharp;
  unlockLanguages(s);
  assert.throws(() => L.complete(s, m, 'abc', 'He razonado sobre mi programa y sus entradas.'), /intent/);
  s.records[m.id] = { attempt: 'Mi razonamiento inicial', verification: { passed: true, hash: 'old' } };
  assert.throws(() => L.complete(s, m, 'abc', 'He razonado sobre mi programa y sus entradas.'), /versión actual/);
  s.records[m.id].verification.hash = 'abc';
  assert.throws(() => L.complete(s, m, 'abc', 'sí'), /reflexión/);
  L.complete(s, m, 'abc', 'He razonado sobre mi programa y sus entradas.');
  const stamp = s.records[m.id].completedAt;
  L.complete(s, m, 'abc', 'He revisado otro caso y explicado el resultado.');
  assert.equal(L.xpTotal(s), foundations.reduce((sum, item) => sum + item.xp, 0) + m.xp);
  assert.equal(s.records[m.id].completedAt, stamp);
});
test('acepta distinto orden si el contrato lo permite, sin perder duplicados', () => {
  assert.equal(L.matches('B: 4.00\r\nA: 3.00\r\n', 'A: 3.00\nB: 4.00', true), true);
  assert.equal(L.matches('B: 4.00\nA: 3.00', 'A: 3.00\nB: 4.00', false), false);
  assert.equal(L.matches('A: 3.00\nA: 3.00', 'A: 3.00', true), false);
});
test('pedir pistas y fallar no resta XP', () => {
  const s = L.freshState();
  s.records[missions[0].id] = { completedAt: 'now', hints: 99, verification: { passed: false } };
  assert.equal(L.xpTotal(s), missions[0].xp);
});
test('los comandos citan correctamente las rutas', () => {
  const commands = R.commandGuide(csharp, "C:\\Mi carpeta\\O'Brien", 'powershell', {});
  assert.equal(commands[0].command, "Set-Location -LiteralPath 'C:\\Mi carpeta\\O''Brien'");
  assert.match(commands[1].command, /^& 'dotnet'/);
  assert.equal(R.quote("/tmp/a'b", 'bash'), "'/tmp/a'\\''b'");
  assert.throws(() => R.quote('C:\\%TEMP%', 'cmd'), /PowerShell/);
});
test('Python y JavaScript usan intérpretes y muestran pasos de terminal propios', () => {
  const python = missions.find(m => m.id === 'py-history');
  const javascript = missions.find(m => m.id === 'js-save');
  assert.equal(R.entryFilename('python'), 'main.py');
  assert.equal(R.entryFilename('javascript'), 'app.js');
  assert.equal(R.runtimeFor('javascript', {}), 'node');
  const pyGuide = R.commandGuide(python, '/tmp/proyecto', 'bash', { pythonPath: '/usr/bin/python3' });
  assert.match(pyGuide[2].command, /py_compile/);
  assert.match(pyGuide[3].command, /'main\.py' 'total'/);
  const jsGuide = R.commandGuide(javascript, 'C:\\Proyecto', 'powershell', { nodePath: 'node' });
  assert.match(jsGuide[2].command, /--check/);
  assert.match(jsGuide[3].command, /'app\.js' 'listar'/);
  assert.equal(L.badges({ records: { 'py-welcome': { completedAt: 'hoy' }, 'js-welcome': { completedAt: 'hoy' } } }).find(b => b.name === 'Dos lenguajes').earned, true);
});
test('C# y C++ avanzan por proyectos intermedios sin saltar misiones', () => {
  const state = L.freshState();
  unlockLanguages(state);
  const paths = {
    csharp: ['cs-save', 'cs-validate', 'cs-report', 'cs-limit'],
    cpp: ['cpp-range', 'cpp-stats', 'cpp-median', 'cpp-save']
  };
  for (const [track, ids] of Object.entries(paths)) {
    const sequence = missions.filter(m => m.track === track);
    assert.deepEqual(sequence.slice(-ids.length).map(m => m.id), ids);
    for (let index = 1; index < ids.length; index++) {
      const current = missions.find(m => m.id === ids[index]);
      assert.equal(L.unlocked(state, current), false);
      state.records[ids[index - 1]] = { completedAt: 'hoy' };
      assert.equal(L.unlocked(state, current), true);
    }
  }
  assert.equal(R.commandGuide(missions.find(m => m.id === 'cs-report'), '/tmp/reporte', 'bash', {})[3].command.includes("'resumen'"), true);
  assert.equal(R.commandGuide(missions.find(m => m.id === 'cs-limit'), '/tmp/limite', 'bash', {})[3].command.includes("'estado'"), true);
  assert.equal(R.commandGuide(missions.find(m => m.id === 'cpp-save'), '/tmp/mediciones', 'bash', {})[3].command.includes("'resumen'"), true);
});
test('captura salida y código de error sin shell', async () => {
  const result = await R.execute(process.execPath, ['-e', 'process.stdout.write("probe");process.exitCode=3']);
  assert.equal(result.output, 'probe'); assert.equal(result.code, 3);
});
test('un compilador ausente produce un error recuperable', async () => {
  const result = await R.execute('aimlearning-missing-executable-123', []);
  assert.notEqual(result.code, 0); assert.match(result.stderr, /No se encontró/);
});
test('detiene procesos infinitos y respeta la cancelación', async () => {
  const result = await R.execute(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { timeout: 200 });
  assert.equal(result.reason, 'timeout');
  const abort = new AbortController(); abort.abort();
  const cancelled = await R.execute(process.execPath, ['-e', 'throw Error()'], { signal: abort.signal });
  assert.equal(cancelled.cancelled, true);
});
test('las misiones de código y fundamentos muestran contenido apropiado sin soluciones', () => {
  assert.equal(new Set(missions.map(m => m.id)).size, missions.length);
  for (const m of missions) {
    assert.ok(m.lesson && m.concepts.length && m.hints.length && m.reflection);
    if (m.kind === 'foundation') {
      assert.ok(m.example.situation && m.example.reasoning && m.challenge.options.length >= 3);
      assert.ok(m.challenge.options.some(option => option.id === m.challenge.answer));
      assert.ok(!m.tests && !m.guidance && !m.example.code);
    } else {
      assert.ok(m.tests.length && m.example.code && m.example.output && m.example.explanation && m.example.steps.length >= 3);
      assert.ok(m.guidance && m.guidance.tools && m.guidance.path && m.guidance.check, 'cada misión debe mostrar el puente entre ejemplo y reto');
      assert.ok(!m.tests.some(t => (t.steps || [t]).some(step => step.expected === m.example.output)), 'el ejemplo debe ser distinto al reto');
      for (const t of m.tests) for (const step of t.steps || [t]) assert.equal(typeof step.expected, 'string');
    }
    assert.ok(!Object.hasOwn(m, 'solution'));
  }
});

test('la actividad sin código exige razonamiento y no revela la respuesta al fallar', () => {
  const s = L.freshState(), m = foundations[0];
  assert.throws(() => L.verifyFoundation(s, m, 'a'), /razonamiento/);
  s.records[m.id] = { attempt: 'Creo que primero debo aclarar la regla que cambia el precio final del pedido.' };
  const wrong = L.verifyFoundation(s, m, 'a');
  assert.equal(wrong.passed, false);
  assert.ok(!wrong.summary.includes(m.challenge.options.find(o => o.id === m.challenge.answer).label));
  assert.throws(() => L.complete(s, m, wrong.hash, 'Revisé qué regla cambia el resultado final del pedido.'), /Comprueba/);
  const right = L.verifyFoundation(s, m, m.challenge.answer);
  assert.equal(right.passed, true);
  L.complete(s, m, right.hash, 'Revisé qué regla cambia el resultado final del pedido.');
  assert.equal(L.xpTotal(s), m.xp);
  assert.match(L.foundationQuestion(s.records[m.id]), /decisión encaja/);
  const tutor = require('../src/tutor');
  assert.equal(tutor.revealsFoundationChoice('La opción b es correcta.', m), true);
  assert.equal(tutor.revealsFoundationChoice(m.challenge.options.find(o => o.id === m.challenge.answer).label, m), true);
  assert.equal(tutor.revealsFoundationChoice('Compara la regla que cambia el importe final.', m), false);
});

test('decodifica la salida de Windows sin romper UTF-8', () => {
  const { decodeConsoleBytes } = require('../src/console-encoding');
  assert.equal(decodeConsoleBytes(Buffer.from([0x42,0x69,0x74,0xa0,0x63,0x6f,0x72,0x61]), 850), 'Bitácora');
  assert.equal(decodeConsoleBytes(Buffer.from('Música y código', 'utf8'), 850), 'Música y código');
  assert.equal(decodeConsoleBytes(Buffer.from([0x82]), 437), 'é');
});

test('el tutor adapta el contexto a la misión y rechaza soluciones en código', () => {
  const T = require('../src/tutor');
  const m = csharp;
  const context = T.contextFor(m, { attempt: 'Intenté imprimir el texto, pero vi otro mensaje.', dialogue: [{role:'student',text:'No entiendo la salida.'}] }, '¿Dónde está mi error?', 'Program.cs');
  assert.equal(context.mission.title, m.title);
  assert.match(context.projectSource, /Program.cs/);
  assert.equal(context.recentDialogue.length, 1);
  const valid = JSON.stringify({ observation: 'Tu programa produce una línea distinta a la que esperabas.', nextStep: 'Compara primero el texto entre comillas con el contrato.', question: '¿Qué carácter cambia al ejecutar tu programa?' });
  assert.match(T.parseTutorResponse(valid), /Compara primero/);
  assert.equal(T.parseTutorResponse('```cs\nConsole.WriteLine("Bitácora de gastos");\n```'), null);
  assert.equal(T.parseTutorResponse(JSON.stringify({ observation: 'Copia Console.WriteLine("Bitácora de gastos");', nextStep: 'Listo', question: '¿Terminaste?' })), null);
  assert.equal(T.parseTutorResponse(JSON.stringify({ observation: 'x', nextStep: 'y', question: 'z', solution: 'code' })), null);
});

test('OpenAI recibe solo el contexto de la misión y extrae el texto estructurado', async () => {
  const T = require('../src/tutor');
  let request;
  const fakeFetch = async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => ({ status: 'completed', output: [{type:'reasoning'}, { type:'message', content: [{type:'output_text', text:'{"observation":"Veo un intento","nextStep":"Revisa tu entrada","question":"¿Qué esperabas leer?"}'}]}] }) };
  };
  const raw = await T.sendOpenAI('clave-simulada', 'gpt-6-luna', { mission: { title: 'Prueba' }, projectSource: 'Program.cs' }, fakeFetch);
  assert.match(T.parseTutorResponse(raw), /Revisa tu entrada/);
  assert.equal(request.url, 'https://api.openai.com/v1/responses');
  assert.equal(request.options.headers.Authorization, 'Bearer clave-simulada');
  const body = JSON.parse(request.options.body);
  assert.equal(body.store, false);
  assert.equal(body.text.format.type, 'json_schema');
  assert.equal(body.model, 'gpt-6-luna');
  assert.ok(!request.options.body.includes('clave-simulada'));
  assert.match(body.input, /Program.cs/);
});

test('las direcciones de modelos locales quedan limitadas a este equipo', () => {
  const local = require('../src/local-models');
  assert.equal(local.localBase('http://127.0.0.1:11434/', 'ollama'), 'http://127.0.0.1:11434');
  assert.equal(local.localBase('http://localhost:1234', 'compatible'), 'http://localhost:1234/v1');
  assert.equal(local.localBase('http://[::1]:1234/v1', 'compatible'), 'http://[::1]:1234/v1');
  for (const url of ['https://example.com/v1', 'http://example.com/v1', 'http://127.0.0.1:1234/secret', 'http://user:pass@127.0.0.1:1234/v1']) {
    assert.throws(() => local.localBase(url, 'compatible'));
  }
});

test('Ollama descubre modelos y recibe una solicitud sin herramientas', async () => {
  const local = require('../src/local-models');
  const requests = [];
  const fakeFetch = async (url, options) => {
    requests.push({ url, options });
    if (url.endsWith('/api/tags')) return { ok: true, json: async () => ({ models: [{ name: 'qwen-local:latest' }] }) };
    return { ok: true, json: async () => ({ message: { content: '{"observation":"Revisa la lectura","nextStep":"Sigue los datos","question":"¿Qué llegó primero?"}' } }) };
  };
  const found = await local.listLocalModels('ollama', 'http://127.0.0.1:11434', fakeFetch);
  assert.deepEqual(found.models, [{ id: 'qwen-local:latest' }]);
  const raw = await local.sendLocal('ollama', found.base, found.models[0].id, { projectSource: 'Program.cs' }, fakeFetch);
  assert.match(require('../src/tutor').parseTutorResponse(raw), /Sigue los datos/);
  assert.equal(requests[1].url, 'http://127.0.0.1:11434/api/chat');
  const body = JSON.parse(requests[1].options.body);
  assert.equal(body.stream, false);
  assert.equal(body.format.type, 'object');
  assert.equal(body.think, false, 'El razonamiento interno no debe consumir el límite de respuesta del profesor');
  assert.equal(body.tools, undefined);
  assert.match(body.messages[1].content, /Program.cs/);
});

test('un servidor compatible descubre modelos y conversa sin ejecutar herramientas', async () => {
  const local = require('../src/local-models');
  const requests = [];
  const fakeFetch = async (url, options) => {
    requests.push({ url, options });
    if (url.endsWith('/models')) return { ok: true, json: async () => ({ data: [{ id: 'modelo-local' }] }) };
    return { ok: true, json: async () => ({ choices: [{ message: { content: '{"observation":"Tu intento lee un dato","nextStep":"Prueba otra entrada","question":"¿Cuántas líneas esperas?"}' } }] }) };
  };
  const found = await local.listLocalModels('compatible', 'http://localhost:1234/v1', fakeFetch);
  assert.deepEqual(found.models, [{ id: 'modelo-local' }]);
  const raw = await local.sendLocal('compatible', found.base, 'modelo-local', { attempt: 'Estoy probando' }, fakeFetch);
  assert.match(require('../src/tutor').parseTutorResponse(raw), /Prueba otra entrada/);
  assert.equal(requests[1].url, 'http://localhost:1234/v1/chat/completions');
  const body = JSON.parse(requests[1].options.body);
  assert.equal(body.model, 'modelo-local');
  assert.equal(body.think, undefined, 'La opción de Ollama no se envía a servidores compatibles');
  assert.equal(body.tools, undefined);
});
