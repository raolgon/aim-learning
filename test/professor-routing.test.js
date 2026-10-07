'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const {missions} = require('../src/catalog');
const notices = [], requests = [];
const disposable = () => ({dispose(){}});
const root = path.resolve(__dirname, '..');
const view = {postMessage:async message=>notices.push(message),asWebviewUri:uri=>uri.fsPath,onDidReceiveMessage:disposable,cspSource:'test'};
const vscode = {
 StatusBarAlignment:{Left:1},ViewColumn:{Beside:2},
 Uri:{file:fsPath=>({fsPath}),joinPath:(uri,...parts)=>({fsPath:path.join(uri.fsPath,...parts)})},
 window:{createStatusBarItem:()=>({show(){},dispose(){}}),registerWebviewViewProvider:disposable,createWebviewPanel:()=>({webview:view,onDidDispose:disposable,reveal(){}})},
 workspace:{workspaceFolders:[{name:'Isolated',uri:{fsPath:path.join(root,'.nonexistent-routing-workspace')}}],isTrusted:true,saveAll:async()=>true,getConfiguration:()=>({get:(key,fallback)=>fallback}),onDidGrantWorkspaceTrust:disposable,onDidChangeConfiguration:disposable},
 commands:{registerCommand:disposable,executeCommand:async()=>{}}
};
const originalLoad=Module._load;
Module._load=function(name,...rest){return name==='vscode'?vscode:originalLoad.call(this,name,...rest);};
const {activate}=require('../src/extension');
Module._load=originalLoad;
const storage=()=>{const values=new Map();return {get:(key,fallback)=>values.get(key)??fallback,update:async(key,value)=>values.set(key,value)}};
async function setup(){
 notices.length=0;requests.length=0;
 const context={subscriptions:[],workspaceState:storage(),globalState:storage(),secrets:{get:async()=>null,delete:async()=>{}},extensionUri:{fsPath:root}};
 const api=activate(context);
 await api.open();
 const state=api.getState();
 for(const m of missions)state.records[m.id]={completedAt:'fixture',attempt:'Describí mi intento y comparé el resultado con lo que esperaba.'};
 state.selected='base-contract';state.projectSelected='project-cs-gui';
 state.projectRecords['project-cs-gui']={milestones:{0:'Diseñé los controles y separé la entrada y la validación.'},hints:{},dialogue:[]};
 state.gitRecords={steps:{status:{attempt:'Comparé los estados antes y después de preparar mis archivos.'}}};
 return {api,state,context};
}
const model={provider:'ollama',baseUrl:'http://localhost:11434',id:'gemma4:e2b',name:'Gemma e2b'};
function stub(content){global.fetch=async(url,options)=>{requests.push(JSON.parse(options.body));return {ok:true,json:async()=>({message:{content}})}};}
const raw=JSON.stringify({observation:'Registraste una idea propia.',nextStep:'Compara los estados antes y después.',question:'¿Qué cambió con tu último intento?'});
function latest(state){return state.records[state.selected].dialogue?.at(-1);}
test('sin IA las misiones, proyectos y pistas conservan la orientación local',async()=>{
 const originalFetch=global.fetch;global.fetch=async()=>{throw Error('No debería consultar la red')};
 try{
  const {api,state}=await setup();
  await api.handle({type:'professor',useAI:true,text:'¿Cómo avanzo?'});assert.match(latest(state).source,/local/);
  await api.handle({type:'hint'});assert.equal(latest(state).source,'Pista para razonar');
  await api.handle({type:'projectProfessor',index:0,text:'¿Cómo avanzo?'});assert.match(state.projectRecords['project-cs-gui'].dialogue.at(-1).source,/local/i);
  await api.handle({type:'projectHint',index:0});assert.ok(state.projectRecords['project-cs-gui'].hints[0]);
  await api.handle({type:'gitHint',step:0});assert.ok(state.gitRecords.steps.status.hint);
 }finally{global.fetch=originalFetch;}
});
test('con IA todos los botones de guía y pista llaman al modelo, incluyendo proyectos y Git',async()=>{
 const originalFetch=global.fetch;
 try{
  const {api,state}=await setup();state.aiModel={...model};stub(raw);
  state.records[state.selected].dialogue=Array.from({length:40},(_,i)=>({role:i%2?'professor':'student',text:'Mensaje anterior '+i}));
  await api.handle({type:'professor',useAI:false,text:'¿Qué comparo?'});assert.match(latest(state).source,/^Tutor de IA/);
  assert.equal(state.records[state.selected].dialogue.length,42);assert.equal(state.records[state.selected].dialogue[0].text,'Mensaje anterior 0');
  await api.handle({type:'hint'});assert.match(latest(state).source,/^Tutor de IA/);
  await api.handle({type:'projectProfessor',index:0,text:'¿Cómo decido?'});assert.match(state.projectRecords['project-cs-gui'].dialogue.at(-1).source,/^Tutor de IA/);
  assert.match(JSON.parse(requests[2].messages[1].content).mission.requirements[0],/Dibuja/);
  await api.handle({type:'projectHint',index:0});assert.match(state.projectRecords['project-cs-gui'].dialogue.at(-1).source,/^Tutor de IA/);assert.equal(state.projectRecords['project-cs-gui'].hints[0],undefined);
  await api.handle({type:'gitHint',step:0});assert.match(state.gitRecords.steps.status.hintSource,/^Tutor de IA/);assert.ok(JSON.parse(requests[4].messages[1].content).mission.goal);
  assert.equal(requests.length,5);assert.equal((await api.getPayload()).busy,false);
  const empty=state.records['base-contract'];empty.attempt='';const count=requests.length;
  await api.handle({type:'professor'});assert.equal(requests.length,count);
 }finally{global.fetch=originalFetch;}
});
test('errores, respuestas inválidas y soluciones conceptuales no generan sustituciones locales',async()=>{
 const originalFetch=global.fetch;
 try{
  const {api,state}=await setup();state.aiModel={...model};
  const before=()=>JSON.stringify({mission:state.records[state.selected].dialogue,project:state.projectRecords['project-cs-gui'].dialogue,git:state.gitRecords.steps.status.hint});
  for(const failure of ['network','http','invalid','answer']){
   if(failure==='network')global.fetch=async()=>{throw new TypeError('offline')};
   else if(failure==='http')global.fetch=async()=>({ok:false,status:500});
   else if(failure==='invalid')stub('');
   else stub(JSON.stringify({observation:'Respuesta '+missions[0].challenge.answer,nextStep:'Elige esa opción.',question:'¿Por qué?'}));
   const prior=before();await api.handle({type:'professor'});assert.equal(before(),prior,failure);assert.equal(notices.at(-1).kind,'error');assert.equal((await api.getPayload()).busy,false);
  }
  global.fetch=async()=>{throw new TypeError('offline')};
  for(const action of [{type:'hint'},{type:'projectProfessor',index:0},{type:'projectHint',index:0},{type:'gitHint',step:0}]){const prior=before();await api.handle(action);assert.equal(before(),prior);assert.equal((await api.getPayload()).busy,false);}
  state.aiModel={provider:'laya',name:'Legacy Laya'};const prior=before();await api.handle({type:'professor'});assert.equal(before(),prior);assert.match(notices.at(-1).text,/no genera/);
 }finally{global.fetch=originalFetch;}
});

test('revisar una lección no completa el reto y se conserva al abrir otra carpeta',async()=>{
 const {api,state,context}=await setup();state.records={};
 await api.handle({type:'lessonReviewed'});const record=state.records['base-contract'];
 assert.ok(record.lessonReviewedAt);assert.equal(record.attempt,undefined);assert.equal(record.verification,undefined);assert.equal(record.completedAt,undefined);assert.equal(require('../src/learning').xpTotal(state),0);
 state.selected='cs-welcome';for(const m of missions.filter(m=>m.kind==='foundation'))state.records[m.id]={completedAt:'fixture'};
 await api.handle({type:'lessonReviewed'});
 const newContext={...context,workspaceState:storage()};const newApi=activate(newContext);
 assert.ok(newApi.getState().records['cs-welcome'].lessonReviewedAt);
 assert.equal(newApi.getState().records['cs-welcome'].completedAt,undefined);
});
test('preparación respeta confianza, consulta herramientas y abre un perfil sin enviar comandos',async()=>{
 const Setup=require('../src/mission-setup');const originalDiagnose=Setup.diagnose;let calls=0,terminalOptions;
 const createTerminal=vscode.window.createTerminal;
 try{
  const {api,state}=await setup();state.selected='cs-welcome';
  Setup.diagnose=async(track,tools)=>{calls++;return {ready:true,signature:Setup.signature(track,tools),version:'8.0.401'};};
  vscode.workspace.isTrusted=false;await api.handle({type:'missionTools'});assert.equal(calls,0);assert.equal((await api.getPayload()).missionSetup.stage,'trust');
  vscode.workspace.isTrusted=true;await api.handle({type:'setupTerminal'});assert.equal(state.missionSetups,undefined);
  await api.handle({type:'missionTools'});assert.equal(calls,1);assert.equal((await api.getPayload()).missionSetup.stage,'terminal');
  vscode.window.createTerminal=options=>{terminalOptions=options;return {show(){},processId:Promise.resolve(123)}};
  await api.handle({type:'setupTerminal'});assert.equal((await api.getPayload()).missionSetup.stage,'files');
  assert.equal(terminalOptions.cwd,vscode.workspace.workspaceFolders[0].uri.fsPath);assert.ok(terminalOptions.shellPath);assert.equal(terminalOptions.shellArgs,undefined);
  state.missionSetups.csharp.report.signature='stale';assert.equal((await api.getPayload()).missionSetup.stage,'tools');
  assert.equal((await api.getPayload()).busy,false);
 }finally{Setup.diagnose=originalDiagnose;vscode.window.createTerminal=createTerminal;vscode.workspace.isTrusted=true;}
});

test('la ayuda conceptual funciona antes del intento sin revelar ni desbloquear el reto',async()=>{
 const originalFetch=global.fetch;
 try {
  const {api,state}=await setup();state.records['base-contract']={};
  global.fetch=async()=>{throw new Error('No debe usar IA sin conexión')};
  await api.handle({type:'conceptProfessor',text:'No entiendo qué es una regla.'});
  const record=state.records['base-contract'];assert.match(record.dialogue.at(-1).source,/conceptual/);
  assert.equal(record.attempt,undefined);assert.equal(record.verification,undefined);assert.equal(record.completedAt,undefined);
  const before=record.dialogue.length;
  await api.handle({type:'hint'});assert.equal(record.dialogue.length,before);assert.match(notices.at(-1).text,/intento/);
  await api.handle({type:'verify',choice:missions[0].challenge.answer});assert.equal(record.verification,undefined);
  await api.handle({type:'professor',text:'Dame una pista del reto.'});assert.equal(record.dialogue.length,before);
 } finally {global.fetch=originalFetch;}
});

test('con IA la ayuda conceptual genera respuestas con contexto de lección sin código ni contrato',async()=>{
 const originalFetch=global.fetch,folders=vscode.workspace.workspaceFolders,trusted=vscode.workspace.isTrusted;
 try {
  const {api,state}=await setup();state.selected='cs-welcome';state.records['cs-welcome']={dialogue:[{role:'student',text:'SECRET_EXERCISE_HISTORY'}]};state.aiModel={...model};
  vscode.workspace.workspaceFolders=[];vscode.workspace.isTrusted=false;stub(raw);
  await api.handle({type:'conceptProfessor',text:'¿Qué significa salida?'});
  assert.equal(requests.length,1);const sent=JSON.parse(requests[0].messages[1].content);
  assert.equal(sent.scope,'concept');assert.ok(sent.mission.lesson);assert.equal(sent.projectSource,undefined);assert.equal(sent.attempt,undefined);assert.equal(sent.verification,undefined);assert.equal(sent.mission.requirements,undefined);assert.equal(sent.mission.goal,undefined);
  assert.equal(JSON.stringify(sent).includes('SECRET_EXERCISE_HISTORY'),false);
  assert.match(latest(state).source,/Tutor de IA/);assert.equal(latest(state).scope,'concept');assert.equal(state.records['cs-welcome'].attempt,undefined);
  const before=state.records['cs-welcome'].dialogue.length;
  global.fetch=async()=>{throw new TypeError('offline')};await api.handle({type:'conceptProfessor',text:'¿Qué significa entrada?'});
  assert.equal(state.records['cs-welcome'].dialogue.length,before);assert.equal(notices.at(-1).action,'conceptProfessor');assert.equal(notices.at(-1).key,'mission:cs-welcome');assert.equal((await api.getPayload()).busy,false);
 } finally {global.fetch=originalFetch;vscode.workspace.workspaceFolders=folders;vscode.workspace.isTrusted=trusted;}
});

test('el error del intento señala su campo y un intento breve no abre pistas',async()=>{
 const {api,state}=await setup();state.records['base-contract']={};
 await api.handle({type:'attempt',text:'No entiendo'});
 const error=notices.at(-1);assert.equal(error.kind,'error');assert.equal(error.field,'attempt');assert.equal(error.action,'attempt');assert.equal(error.key,'mission:base-contract');
 assert.equal(state.records['base-contract'].attempt,undefined);
 await api.handle({type:'attempt',text:'Entiendo que hay datos, pero todavía no sé distinguirlos de una regla.'});
 assert.ok(state.records['base-contract'].attempt);assert.equal(state.records['base-contract'].completedAt,undefined);
 assert.equal(notices.at(-1).kind,'success');assert.equal(notices.at(-1).field,'attempt');
});

test('la ayuda conceptual rechaza opciones reveladas por la IA y mantiene bloqueadas las lecciones pendientes',async()=>{
 const originalFetch=global.fetch;
 try {
  const {api,state}=await setup();state.records={};state.aiModel={...model};
  const answer=missions[0].challenge.options.find(option=>option.id===missions[0].challenge.answer).label;
  stub(JSON.stringify({observation:answer,nextStep:'Elige esa opción.',question:'¿Por qué?'}));
  await api.handle({type:'conceptProfessor',text:'¿Qué es una regla?'});
  assert.equal(state.records['base-contract']?.dialogue,undefined);assert.equal(notices.at(-1).kind,'error');assert.match(notices.at(-1).text,/revelaba/);
  state.selected=missions.find(m=>m.kind==='foundation' && m.id!=='base-contract').id;
  const count=requests.length;await api.handle({type:'conceptProfessor',text:'Explica la siguiente lección.'});assert.equal(requests.length,count);assert.equal((await api.getPayload()).busy,false);
 } finally {global.fetch=originalFetch;}
});

test('las consultas de lección, proyecto y Git pueden cancelarse sin guardar respuestas ni sustituciones',async()=>{
 const originalFetch=global.fetch;
 try {
  for(const action of [{type:'professor',text:'Pregunta pendiente'},{type:'conceptProfessor',text:'Pregunta conceptual pendiente'},{type:'projectProfessor',index:0,text:'Pregunta de proyecto pendiente'},{type:'gitHint',step:0}]) {
   const {api,state}=await setup();state.aiModel={...model};let start,release,signal;
   const started=new Promise(resolve=>start=resolve);
   global.fetch=async(u,options)=>{signal=options.signal;start();return new Promise(resolve=>release=resolve);};
   const snapshot=JSON.stringify(state),pending=api.handle(action);await started;
   const request=(await api.getPayload()).tutorRequest;assert.ok(request.id);assert.ok(request.startedAt);
   await api.handle({type:'cancelTutor',requestId:'stale-id'});assert.equal(signal.aborted,false);
   await api.handle({type:'cancelTutor',requestId:request.id});await pending;
   assert.equal(signal.aborted,true);assert.equal(JSON.stringify(state),snapshot);assert.equal((await api.getPayload()).busy,false);
   assert.equal(notices.at(-1).type,'tutorCancelled');assert.equal(notices.at(-1).requestId,request.id);
   release({ok:true,json:async()=>({message:{content:raw}})});await new Promise(resolve=>setImmediate(resolve));assert.equal(JSON.stringify(state),snapshot);
   stub(raw);await api.handle({type:'professor',text:'Reintento'});assert.match(latest(state).source,/Tutor de IA/);assert.ok(latest(state).requestId);
  }
 }finally{global.fetch=originalFetch;}
});
test('cancelar un modelo de VS Code propaga la señal y libera el token',async()=>{
 const originalLm=vscode.lm,originalToken=vscode.CancellationTokenSource,originalMessage=vscode.LanguageModelChatMessage;
 try {
  const {api,state}=await setup();state.aiModel={provider:'vscode',id:'fixture',name:'Fixture'};let started,cancelled=0,disposed=0;
  const ready=new Promise(resolve=>started=resolve);
  vscode.CancellationTokenSource=class{token={};cancel(){cancelled++;}dispose(){disposed++;}};
  vscode.LanguageModelChatMessage={User:content=>({content})};
  vscode.lm={selectChatModels:async()=>[{id:'fixture',sendRequest:async()=>{started();return new Promise(()=>{});}}]};
  const before=JSON.stringify(state),pending=api.handle({type:'professor',text:'Pendiente'});await ready;
  await api.handle({type:'cancelTutor',requestId:(await api.getPayload()).tutorRequest.id});await pending;
  assert.equal(cancelled,1);assert.equal(disposed,1);assert.equal(JSON.stringify(state),before);assert.equal((await api.getPayload()).busy,false);
 }finally{vscode.lm=originalLm;vscode.CancellationTokenSource=originalToken;vscode.LanguageModelChatMessage=originalMessage;}
});
test('el acierto conceptual comprueba la opción sin certificar razonamiento ni completar la misión',async()=>{
 const {api,state}=await setup();delete state.records['base-contract'].completedAt;
 await api.handle({type:'verify',choice:missions[0].challenge.answer});
 assert.equal(state.records['base-contract'].verification.passed,true);assert.equal(state.records['base-contract'].completedAt,undefined);
 assert.match(notices.at(-1).text,/no hemos evaluado/);assert.doesNotMatch(notices.at(-1).text,/fundamentada/);
 const payload=await api.getPayload();assert.ok(payload.missions.filter(m=>m.kind==='foundation').every(m=>m.transferQuestion));
});
