'use strict';
const path = require('node:path');
const i18n = require('./i18n');

function firstDiagnostic(details = '') {
  const line = String(details).split(/\r?\n/).map(item => item.trim()).find(item => /(?:\berror\b|\bfatal\b|\bfailed\b|error\s+[A-Z]{1,3}\d+)/i.test(item));
  if (!line) return null;
  const location = /([^/\\\s:]+\.(?:cs|cpp|cc|cxx|h|hpp))[:(](\d+)/i.exec(line);
  const category = /not found|no such file|no se encontr[oó]|NU\d+|package/i.test(line) ? 'dependencia o archivo'
    : /does not exist|not declared|undefined|no existe|no est[aá] definido|CS0103/i.test(line) ? 'nombre o alcance'
    : /cannot convert|no matching|type|tipo|CS0029/i.test(line) ? 'tipo de dato'
    : /expected|syntax|sintaxis|CS1002/i.test(line) ? 'sintaxis' : 'compilación';
  return { location: location ? path.basename(location[1]) + ', línea ' + location[2] : '', category };
}

function topic(project, message, stage) {
  const text = String(message || '').toLowerCase();
  if (/persist|reinici|base de datos|sqlite|archivo|restart|database|file/.test(text)) return 'Si cierras el proceso ahora, ¿de dónde volverán los datos al iniciarlo otra vez?';
  if (/inv[aá]lid|valid|negativ|error|rechaz|reject/.test(text)) return '¿Qué dato debe permanecer sin cambios cuando rechazas esa entrada? Prueba un caso válido y otro inválido.';
  if (/prueba|test|ctest|resultado|result/.test(text)) return '¿Qué entrada pequeña haría fallar tu prueba si la lógica fuera incorrecta?';
  if (/interfaz|ventana|bot[oó]n|evento|interface|window|button|event/.test(text)) return '¿Qué cambia en la pantalla después de esa acción y qué estado debería permanecer igual?';
  if (/git|rama|pull request|workflow|ci|branch/.test(text)) return '¿Qué evidencia local confirma el cambio y qué parte solo puedes comprobar en GitHub?';
  return project.milestones[stage].hint + ' ¿Qué caso mínimo podrías probar para comprobar tu idea?';
}

function guidance(project, record, stage, message, sourceNames = [], language = 'es') {
  const verification = record.verification;
  const evidence = verification?.behavior;
  const diagnostic = verification?.phase === 'build' ? firstDiagnostic(verification.details) : null;
  if (language === 'en') {
    if (diagnostic) return {text:'The build stopped' + (diagnostic.location ? ' at ' + diagnostic.location.replace(', línea ', ', line ') : '') + ' because of a problem with ' + i18n.text(diagnostic.category, language) + '. Read the first terminal error: what did the compiler expect there, and what is in your file?',source:'Local guide · compilation'};
    if (evidence?.mode === 'automatic' && !evidence.passed) return {text:!evidence.count ? 'No behavior tests ran yet. Look at the three Review cases: which one can you turn into a small test in tests/ first?' : evidence.count + ' tests ran and the review still fails. Which input distinguishes the expected behavior from the observed result in the first failing test? Open its result in the terminal.',source:'Local guide · tests'};
    if (project.kind === 'gui' && Object.values(record.manualChecks || {}).some(result=>result?.status === 'failed')) return {text:'You marked an interface case as failed. What action reproduces it in a newly opened window, and which value changes before you expected?',source:'Local guide · manual test'};
    const entry = sourceNames.find(name => /(?:Program\.cs|main\.cpp|analysis\.cpp)$/i.test(name));
    const question = topic(project, String(message || '') + ' ' + String(record.milestones?.[stage] || ''), stage);
    return {text:(entry ? 'In ' + entry + ', ' : '') + i18n.text(question, language),source:'Local guide · stage ' + (stage + 1)};
  }
  if (diagnostic) {
    const where = diagnostic.location ? ' en ' + diagnostic.location : '';
    return { text: 'La compilación se detuvo' + where + ' por un problema de ' + diagnostic.category + '. Lee el primer error de la terminal: ¿qué esperaba el compilador allí y qué encuentra en tu archivo?', source: 'Guía local · compilación' };
  }
  if (evidence?.mode === 'automatic' && !evidence.passed) {
    if (!evidence.count) return { text: 'Todavía no se ejecutó ninguna prueba del comportamiento. Mira los tres casos de Revisión: ¿cuál puedes convertir primero en una prueba pequeña dentro de tests/?', source: 'Guía local · pruebas' };
    return { text: 'Se ejecutaron ' + evidence.count + ' pruebas y la revisión aún no pasa. ¿Qué entrada distingue el comportamiento esperado del observado en la primera prueba que falla? Abre su resultado en la terminal.', source: 'Guía local · pruebas' };
  }
  if (project.kind === 'gui') {
    const failed = Object.entries(record.manualChecks || {}).find(([, result]) => result?.status === 'failed');
    if (failed) return { text: 'Marcaste un caso de la interfaz como fallido. ¿Qué acción lo reproduce desde una ventana recién abierta y qué dato cambia antes de lo esperado?', source: 'Guía local · prueba manual' };
  }
  const entry = sourceNames.find(name => /(?:Program\.cs|main\.cpp|analysis\.cpp)$/i.test(name));
  const lead = entry ? 'En ' + entry + ', ' : '';
  return { text: lead + topic(project, String(message || '') + ' ' + String(record.milestones?.[stage] || ''), stage), source: 'Guía local · etapa ' + (stage + 1) };
}

module.exports = { guidance, firstDiagnostic };
