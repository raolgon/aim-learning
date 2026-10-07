'use strict';
const { missions } = require('./catalog');
const { projects } = require('./project-labs');
const crypto = require('node:crypto');

const questions = Object.freeze({
  plan: 'Describe con tus palabras qué recibe tu programa y qué debe producir. ¿Qué parte puedes intentar primero?',
  trace: 'Elige una entrada pequeña. ¿Puedes seguir los valores de tus variables paso a paso, sin ejecutar el programa?',
  compile: 'Lee el primer error del compilador. ¿Habla de un nombre, un tipo o de la estructura del programa? ¿En qué línea empieza?',
  boundary: 'Prueba el caso más pequeño permitido y un valor justo en el límite. ¿Tu razonamiento sigue siendo válido?',
  representation: '¿El dato es texto o número en este momento? ¿El problema está en su valor o en cómo lo muestras?',
  state: '¿Qué información necesitas conservar entre dos pasos? ¿En qué momento cambia o se vuelve a iniciar?',
  input: 'Anota las entradas en el orden en que llegan. ¿Cuántos datos consume tu programa y qué espera después?',
  output: 'Compara lo que observaste con lo que pide el contrato. ¿La diferencia está en el cálculo, en el texto o en el formato?',
  persistence: 'Cierra el proceso y vuelve a abrirlo. ¿Dónde quedó la información que la siguiente ejecución necesita?',
  reflect: 'Tu programa superó los casos comprobados. ¿Por qué funciona tu enfoque y qué caso adicional intentarías?',
  stuck: 'Podemos reducir la dificultad. ¿Qué concepto de la lección te resulta menos claro? Explícalo con una frase o un ejemplo.'
});
const foundationQuestions = Object.freeze({
  plan: '¿Qué dato, regla o límite falta aclarar antes de decidir? Explica cómo cambiaría el resultado.',
  retry: 'Tu elección aún no encaja. ¿Qué parte del escenario cambia el resultado? Compara dos casos pequeños sin mirar las opciones.',
  reflect: 'Tu decisión encaja en este caso. ¿Por qué la elegiste y en qué situación podría dejar de servir?',
  stuck: 'Elige una sola frase del escenario. ¿Qué información entra y qué resultado debería salir?'
});

function normalize(output, unordered = false) {
  const lines = String(output).replace(/\r/g, '').trim().split('\n').map(s => s.trimEnd());
  return (unordered ? lines.sort() : lines).join('\n');
}
function matches(output, expected, unordered) { return normalize(output, unordered) === normalize(expected, unordered); }
function fingerprint(files) { return crypto.createHash('sha256').update(files).digest('hex'); }
function freshState() { return { version: 1, track: 'foundations', selected: 'base-contract', projectSelected: 'project-cs-gui', shell: process.platform === 'win32' ? 'powershell' : 'bash', records: {}, projectRecords: {}, gitRecords: { steps: {} }, aiModel: null }; }
function recordFor(state, id) { return state.records[id] || {}; }
function foundationsComplete(state) { return missions.filter(m => m.track === 'foundations').every(m => Boolean(recordFor(state, m.id).completedAt)); }
function initialState(savedState, sharedFoundations = {}) {
  const foundationIds = new Set(missions.filter(m => m.kind === 'foundation').map(m => m.id));
  const state = { ...freshState(), ...(savedState || {}), records: { ...(savedState?.records || {}), ...Object.fromEntries(Object.entries(sharedFoundations).filter(([id]) => foundationIds.has(id))) } };
  if (!savedState && foundationsComplete(state)) {
    state.track = 'csharp'; state.selected = 'cs-welcome';
  }
  if (!foundationsComplete(state) && missions.find(m => m.id === state.selected)?.track !== 'foundations') {
    const first = missions.find(m => m.kind === 'foundation' && !recordFor(state, m.id).completedAt);
    state.track = 'foundations'; state.selected = first?.id || 'base-contract';
  }
  return state;
}
function unlocked(state, mission) {
  if (mission.track !== 'foundations' && !foundationsComplete(state)) return false;
  const sequence = missions.filter(m => m.track === mission.track);
  const i = sequence.findIndex(m => m.id === mission.id);
  return i === 0 || Boolean(recordFor(state, sequence[i - 1].id).completedAt);
}
function verifyFoundation(state, mission, choice) {
  if (mission.kind !== 'foundation') throw new Error('Esta misión requiere comprobar el proyecto.');
  if (!unlocked(state, mission)) throw new Error('Completa primero la misión anterior.');
  const record = recordFor(state, mission.id);
  if (!record.attempt || record.attempt.trim().length < 40) throw new Error('Explica primero tu razonamiento en Profesor con al menos 40 caracteres.');
  if (!mission.challenge.options.some(option => option.id === choice)) throw new Error('Elige una opción antes de comprobar.');
  const passed = choice === mission.challenge.answer;
  record.choice = choice;
  record.verification = {
    passed,
    phase: 'reasoning',
    hash: fingerprint(`${mission.id}:${choice}`),
    summary: passed ? 'Tu decisión encaja con el escenario. Explica por qué antes de continuar.' : mission.challenge.retryHint,
    cases: []
  };
  state.records[mission.id] = record;
  return record.verification;
}
function xpTotal(state) { return missions.reduce((sum, m) => sum + (recordFor(state, m.id).completedAt ? m.xp : 0), 0) + projects.reduce((sum, project) => sum + (state.projectRecords?.[project.id]?.completedAt ? project.xp : 0), 0) + (state.gitRecords?.completedAt ? 120 : 0); }
function rank(xp) { return xp >= 3000 ? 'Arquitecto' : xp >= 700 ? 'Constructor' : xp >= 350 ? 'Explorador' : xp >= 150 ? 'Aprendiz' : 'Primeros pasos'; }
function badges(state) {
  const records = Object.values(state.records);
  return [
    { name: 'Primera conquista', detail: 'Completa una misión y registra tu reflexión.', earned: records.some(r => r.completedAt) },
    { name: 'Pensar en voz alta', detail: 'Registra tu razonamiento en tres misiones.', earned: records.filter(r => r.attempt).length >= 3 },
    { name: 'Una herramienta propia', detail: 'Completa la bitácora con persistencia.', earned: Boolean(recordFor(state, 'cs-save').completedAt) },
    { name: 'Dos lenguajes', detail: 'Completa al menos una misión de dos lenguajes.', earned: new Set(missions.filter(m => m.track !== 'foundations' && recordFor(state, m.id).completedAt).map(m => m.track)).size >= 2 },
    { name: 'Proyecto real', detail: 'Completa un proyecto guiado con evidencias.', earned: projects.some(project => state.projectRecords?.[project.id]?.completedAt) },
    { name: 'Git en práctica', detail: 'Resuelve el recorrido local de Git antes de colaborar en GitHub.', earned: Boolean(state.gitRecords?.completedAt) },
    { name: 'Trabajo compartido', detail: 'Completa un proyecto de GitHub con pruebas y pull request.', earned: projects.some(project => project.kind === 'github' && state.projectRecords?.[project.id]?.completedAt) }
  ];
}
function fallbackQuestion(record, message = '') {
  if (record.verification?.passed) return 'reflect';
  if (record.verification?.phase === 'build') return 'compile';
  const text = message.toLowerCase();
  if (/archivo|guard|persist|file|sav/.test(text)) return 'persistence';
  if (/decimal|tipo|texto|número|numero|type|text|number/.test(text)) return 'representation';
  if (/ciclo|bucle|vuelta|acumul|loop|iteration/.test(text)) return 'state';
  if (/leer|entrada|espera|read|input|wait/.test(text)) return 'input';
  if (/no entiendo|perdido|no sé|no se|don.t understand|lost|don.t know/.test(text)) return 'stuck';
  return record.verification ? 'trace' : 'plan';
}
function foundationQuestion(record, message = '') {
  if (record.verification?.passed) return foundationQuestions.reflect;
  if (record.verification) return foundationQuestions.retry;
  if (/no entiendo|perdido|no sé|no se|don.t understand|lost|don.t know/i.test(message)) return foundationQuestions.stuck;
  return foundationQuestions.plan;
}
function complete(state, mission, currentHash, reflection) {
  const r = recordFor(state, mission.id);
  if (!unlocked(state, mission)) throw new Error('Completa primero la misión anterior.');
  if (!r.attempt) throw new Error('Registra primero lo que intentaste.');
  if (!r.verification?.passed || r.verification.hash !== currentHash) throw new Error('Comprueba la versión actual de tu proyecto antes de completar la misión.');
  if (typeof reflection !== 'string' || reflection.trim().length < 25) throw new Error('Escribe una reflexión con algo de detalle: tu enfoque y una comprobación.');
  r.reflection = reflection.trim().slice(0, 4000);
  r.completedAt ||= new Date().toISOString();
  return r;
}
module.exports = { questions, foundationQuestion, normalize, matches, fingerprint, freshState, initialState, recordFor, foundationsComplete, unlocked, verifyFoundation, xpTotal, rank, badges, fallbackQuestion, complete };
