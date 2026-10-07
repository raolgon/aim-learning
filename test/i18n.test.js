'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const I = require('../src/i18n');
const { missions } = require('../src/catalog');
const Labs = require('../src/project-labs');
const Git = require('../src/git-practice');
const Workspaces = require('../src/project-workspaces');
const Tutor = require('../src/tutor');

test('English preserves every exercise contract and worked example source', () => {
  for (const original of missions) {
    const english = I.content(original, 'en');
    assert.equal(english.id, original.id);
    assert.deepEqual(english.tests, original.tests);
    if (original.example) for (const field of ['code', 'input', 'output']) assert.equal(english.example[field], original.example[field]);
    if (original.challenge) assert.equal(english.challenge.answer, original.challenge.answer);
    assert.notEqual(english.title, original.title, original.id + ' title');
    assert.notEqual(english.lesson, original.lesson, original.id + ' lesson');
  }
  for (const project of Labs.projects) {
    assert.notEqual(I.content(project, 'en').brief, project.brief, project.id);
    assert.equal(I.content(project, 'en').id, project.id);
  }
  for (const step of Git.steps) assert.deepEqual(I.content(step, 'en').commands, step.commands);
  assert.equal(I.text('La salida no coincide con el contrato. Recibido: \"Profesor\\r\\n\"','en').split('Received: ')[1], '\"Profesor\\r\\n\"');
  assert.equal(I.text('2 de 6 misiones','en'),'2 of 6 missions');
  assert.equal(I.text('Etapa 1 de 4','en'),'Stage 1 of 4');
  assert.equal(I.content({command:'agregar artículo 3'},'en').command,'agregar artículo 3');
  assert.deepEqual(I.content(missions, 'es'), missions);
});

test('changing language never translates student notes or mutates progress', () => {
  const saved={selected:'cs-welcome',records:{'cs-welcome':{completedAt:'today',attempt:'Profesor',reflection:'Misiones',dialogue:[{role:'student',text:'Aprende'},{role:'professor',text:'Aprende',source:'Profesor local'},{role:'professor',text:'Aprende',source:'Tutor de IA'}]}},projectRecords:{example:{notes:['Aprende'],reflection:'Profesor'}},gitRecords:{steps:{status:{attempt:'Aprende'}}}};
  const before=structuredClone(saved),english=I.state(saved,'en');
  assert.deepEqual(saved,before);
  assert.equal(english.records['cs-welcome'].attempt,'Profesor');
  assert.equal(english.records['cs-welcome'].reflection,'Misiones');
  assert.equal(english.records['cs-welcome'].completedAt,'today');
  assert.equal(english.records['cs-welcome'].dialogue[0].text,'Aprende');
  assert.equal(english.records['cs-welcome'].dialogue[1].text,'Learn');
  assert.equal(english.records['cs-welcome'].dialogue[2].text,'Aprende');
  assert.deepEqual(english.projectRecords.example.notes,['Aprende']);
  assert.equal(english.gitRecords.steps.status.attempt,'Aprende');
});

test('English teacher keeps reasoning guidance and rejects code or revealed answers', () => {
  const mission=I.content(missions.find(m=>m.kind==='foundation'),'en');
  assert.match(Tutor.instructionsFor('en'),/Respond in English/);
  assert.match(Tutor.instructionsFor('en'),/Never provide the exercise solution/);
  const context=Tutor.contextFor(mission,{attempt:'My own idea'},'Why?',undefined,'en');
  assert.equal(context.language,'en');
  assert.equal(context.attempt,'My own idea');
  assert.match(Tutor.parseTutorResponse(JSON.stringify({observation:'You identified an input.',nextStep:'Compare the relevant constraints.',question:'What can change the result?'}),'en'),/^I notice:/);
  assert.equal(Tutor.parseTutorResponse(JSON.stringify({observation:'Use Console.WriteLine("answer");',nextStep:'Copy it.',question:'Done?'}),'en'),null);
  assert.equal(Tutor.revealsFoundationChoice('The correct option is '+mission.challenge.answer,mission),true);
});

test('English challenge documents preserve source files and never overwrite existing work', async () => {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'aim-language-'));
  try {
    const project=Labs.projects[0],english=I.content(project,'en');
    await Workspaces.create(english,root,8,'en');
    assert.match(await fs.readFile(path.join(root,'RETO.md'),'utf8'),/What to build/);
    assert.equal(await fs.readFile(path.join(root,'Program.cs'),'utf8'),Workspaces.starterFiles(project,8)['Program.cs']);
    await fs.writeFile(path.join(root,'Program.cs'),'my own code');
    await Workspaces.create(english,root,8,'en');
    assert.equal(await fs.readFile(path.join(root,'Program.cs'),'utf8'),'my own code');
  } finally { await fs.rm(root,{recursive:true,force:true}); }
});


test('AI providers receive the chosen language with the same no-solution rules', async () => {
  const Local = require('../src/local-models');
  const requests = [];
  const fakeFetch = async (url, options) => {
    requests.push(JSON.parse(options.body));
    return {ok:true,json:async()=>url.includes('/responses') ? {output:[]} : {message:{content:'{}'},choices:[{message:{content:'{}'}}]}};
  };
  await Tutor.sendOpenAI('fake-key','test-model',{language:'en'},fakeFetch);
  await Local.sendLocal('ollama','http://127.0.0.1:11434','test-model',{language:'en'},fakeFetch);
  await Local.sendLocal('compatible','http://127.0.0.1:1234/v1','test-model',{language:'en'},fakeFetch);
  for (const body of requests) {
    const prompt = body.instructions || body.messages[0].content;
    assert.match(prompt,/Respond in English/);
    assert.match(prompt,/Never provide the exercise solution/);
  }
});


test('English requirements retain the exact CLI vocabulary and required output literals', () => {
  const contracts = {
    'cs-welcome':['Bitácora de gastos'],
    'cs-budget':['Dentro','Excedido'],
    'cs-save':['agregar','Guardado','total'],
    'cs-validate':['agregar','Uso: agregar Categoria Importe','Importe inválido'],
    'cs-report':['agregar','resumen','Categoria: 0.00'],
    'cs-limit':['limite','estado','Límite guardado','Sin límite','Disponible: 0.00','Excedido: 0.00'],
    'cpp-welcome':['Analizador listo'],
    'cpp-save':['agregar','Guardado','resumen','Cantidad:','Promedio:'],
    'py-welcome':['Registro de hábitos listo'],
    'py-history':['registrar','Registrado','historial','total'],
    'js-welcome':['Gestor de tareas listo'],
    'js-pending':['pendiente','hecha'],
    'js-save':['agregar','Guardada','listar','completar','Completada']
  };
  for (const [id,literals] of Object.entries(contracts)) {
    const mission = I.content(missions.find(m=>m.id===id),'en');
    for (const literal of literals) assert.ok(mission.requirements.join(' ').includes(literal),id+' keeps '+literal);
  }
  for (const step of Git.steps) {
    const english = I.content(step,'en');
    for (const field of ['task','evidence','hint']) for (const literal of ['mensaje.txt','idea-alternativa','PROPUESTA-PR.md']) {
      if (step[field]?.includes(literal)) assert.ok(english[field].includes(literal),field+' keeps '+literal);
    }
  }
});
