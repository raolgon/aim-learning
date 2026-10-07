'use strict';
const { localBase, requestJson } = require('./local-models');

// Only an allowlisted choice can influence the reply. No server-generated prose,
// exercise answers, option labels or hidden hints are used in this request.
const criteria = {
  en: {
    clarify: 'Does not understand inputs, rules or the expected result.',
    trace: 'Needs to trace steps to find an incorrect result.',
    boundary: 'Unsure about equality, empty input or boundary cases.',
    representation: 'Unsure about data types and converting text to numbers.',
    persistence: 'Loses data when the program closes; needs storage across executions.',
    design: 'Mixes interface, logic and storage; needs separate responsibilities.'
  },
  es: {
    clarify: 'No entiende las entradas, reglas o el resultado esperado.',
    trace: 'Necesita seguir los pasos para encontrar un resultado incorrecto.',
    boundary: 'Duda sobre casos de igualdad, entrada vacía o límites.',
    representation: 'Duda sobre tipos de datos y conversión entre texto y números.',
    persistence: 'Pierde datos al cerrar el programa; necesita guardarlos entre ejecuciones.',
    design: 'Mezcla interfaz, lógica y almacenamiento; necesita separar responsabilidades.'
  }
};
const shortText = (value, limit) => String(value || '').slice(0, limit).replace(/[\uD800-\uDBFF]$/, '');
const cards = {
  es: {
    clarify: ['Podemos empezar aclarando el problema.', 'Separa los datos que recibes, las reglas y el resultado esperado.', '¿Qué información falta para decidir qué debería ocurrir?'],
    trace: ['Podemos investigar una ejecución concreta.', 'Elige una entrada pequeña y anota qué cambia en cada paso de tu intento.', '¿Dónde aparece la primera diferencia entre lo esperado y lo observado?'],
    boundary: ['Podemos explorar los límites de una regla.', 'Compara un caso normal con uno en el límite; predice ambos resultados antes de ejecutarlos.', '¿Qué debería ocurrir justo cuando se cumple la igualdad o no hay datos?'],
    representation: ['Podemos revisar cómo representas los datos.', 'Identifica qué valores son texto, números o colecciones y dónde necesitas convertirlos.', '¿Qué operación exige cada tipo y qué entrada pondría a prueba tu elección?'],
    persistence: ['Podemos distinguir memoria y datos guardados.', 'Describe qué información debe seguir disponible después de cerrar el proceso.', '¿Cómo sabrá la siguiente ejecución lo que hizo la anterior?'],
    design: ['Podemos separar las responsabilidades.', 'Distingue la entrada del usuario, la regla de negocio y la presentación del resultado.', '¿Qué parte puedes comprobar por separado sin depender de toda la interfaz?'],
    reflect: ['Podemos profundizar en tu razonamiento.', 'Explica por qué funciona tu enfoque y qué demuestran las comprobaciones que realizaste.', '¿Qué caso todavía no has comprobado y qué aprenderías al intentarlo?'],
    answer: ['Puedo orientarte, pero la solución debes construirla tú.', 'Describe una parte concreta que intentaste y qué te impide avanzar.', '¿Qué dato, regla o resultado puedes aclarar primero?'],
    compile: ['La comprobación registra un problema de compilación o sintaxis.', 'Lee el primer error de la terminal y compara lo que espera la herramienta con tu archivo.', '¿Qué parte del mensaje describe la causa y cuál es una consecuencia?']
  },
  en: {
    clarify: ['We can start by clarifying the problem.', 'Separate the inputs, the rules and the expected result.', 'What information is missing before you can decide what should happen?'],
    trace: ['We can investigate one concrete execution.', 'Choose a small input and note what changes at each step of your attempt.', 'Where does the first difference between expected and observed behavior appear?'],
    boundary: ['We can explore the boundaries of a rule.', 'Compare a normal case with a boundary case; predict both outcomes before running them.', 'What should happen exactly at equality or when there is no data?'],
    representation: ['We can review how you represent the data.', 'Identify text, numbers and collections, and where conversion is needed.', 'What operation does each type require, and which input would challenge your choice?'],
    persistence: ['We can distinguish memory from saved data.', 'Describe what information must remain after the process closes.', 'How will the next execution know what the previous one did?'],
    design: ['We can separate responsibilities.', 'Distinguish user input, the business rule and presentation of the result.', 'Which part can you check separately without depending on the whole interface?'],
    reflect: ['We can explore your reasoning further.', 'Explain why your approach works and what your checks actually demonstrate.', 'Which case have you not checked yet, and what would you learn by trying it?'],
    answer: ['I can guide you, but you need to build the solution yourself.', 'Describe one specific part you attempted and what is blocking you.', 'Which input, rule or expected result can you clarify first?'],
    compile: ['The recorded check reports a build or syntax problem.', 'Read the first terminal error and compare what the tool expects with your file.', 'Which part of the message describes the cause, and which describes a consequence?']
  }
};
function preparedReply(topic, language) {
  const en = language === 'en';
  const card = cards[en ? 'en' : 'es'][topic] || cards[en ? 'en' : 'es'].clarify;
  const headings = en ? ['I notice', 'Try next', 'Think about'] : ['Observo', 'Prueba ahora', 'Para pensar'];
  return card.map((value, index) => headings[index] + ': ' + value).join('\n\n');
}
async function guidance(base, model, context, key = '', fetchImpl = fetch) {
  const checked = localBase(base, 'laya');
  const en = context.language === 'en';
  const options = criteria[en ? 'en' : 'es'];
  // Plain text and matching question language improve multilingual classification.
  // Verification is handled locally below and cannot bias the model toward reflection.
  const state = en
    ? `Student attempt: ${shortText(context.attempt, 650)}\nStudent question: ${shortText(context.question, 450)}`
    : `Intento del estudiante: ${shortText(context.attempt, 650)}\nPregunta del estudiante: ${shortText(context.question, 450)}`;
  const body = {state, questions:{support:{type:'choice',instructions:en ? 'What is the main difficulty the student describes?' : '¿Cuál es la dificultad principal del estudiante?',criteria:options}},lang:en ? 'en' : 'es',max_len:en && model !== 'multilingual' ? 512 : 1024,min_confidence:0.55};
  if (['english','multilingual','typed-decisions'].includes(model)) body.model = model;
  const result = await requestJson(`${checked}/v1/systemone`, {
    method:'POST',headers:{'Content-Type':'application/json',...(key ? {Authorization:`Bearer ${key}`} : {})},body:JSON.stringify(body)
  },fetchImpl,120000);
  const answer = result?.answers?.support;
  if (!answer || !Object.hasOwn(options, answer.choice)) throw new Error(context.language === 'en' ? 'Laya did not return a valid teaching choice. The prepared local guide is available.' : 'Laya no devolvió una elección pedagógica válida. La guía local preparada sigue disponible.');
  const probability = answer.answer_confidence ?? answer.probabilities?.[answer.choice];
  const uncertain = answer.low_confidence === true || answer.abstention === 'abstained' || answer.abstention === 'unevaluated' || !Number.isFinite(probability) || probability < 0.55 || result.usage?.truncated === true;
  let topic = uncertain ? 'clarify' : answer.choice;
  // Recorded checks are authoritative evidence; a classifier cannot override them.
  if (context.verification?.phase === 'build' && !context.verification.passed) topic = 'compile';
  else if (context.verification?.passed) topic = 'reflect';
  if (/(?:dame|mu[eé]strame|escribe).{0,45}(?:respuesta|soluci[oó]n|programa|c[oó]digo).{0,15}(?:complet|final)|(?:give|write|show|output).{0,45}(?:complete|full|final).{0,25}(?:solution|answer|program|code)/i.test(context.question || '')) topic = 'answer';
  if (context.foundation && !['clarify','trace','boundary','reflect','answer'].includes(topic)) topic = 'clarify';
  return {text:preparedReply(topic,context.language),source:context.language === 'en' ? `Laya · ${uncertain ? 'general guidance' : 'prepared guidance'}` : `Laya · ${uncertain ? 'orientación general' : 'guía preparada'}`};
}
module.exports = { guidance };
