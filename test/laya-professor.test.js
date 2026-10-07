'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Laya=require('../src/laya-professor');
const {localBase}=require('../src/local-models');
const fixture={language:'es',mission:{title:'Práctica',goal:'SECRET_GOAL',challenge:{answer:'SECRET_ANSWER'}},attempt:'Registré mi intento antes de consultar.',question:'¿Cómo puedo conservar los datos?',projectSource:'SECRET_SOURCE',recentDialogue:[{text:'SECRET_HISTORY'}],verification:{passed:false,phase:'tests',summary:'SECRET_SUMMARY'}};
const mock=(answer,extra={})=>async()=>({ok:true,json:async()=>({answers:{support:answer},...extra})});
const decision=(choice='persistence',extra={})=>({type:'choice',choice,answer_confidence:0.9,...extra});

test('Laya sends only the short teaching context and does not mutate progress or notes',async()=>{
 let payload,headers,url;
 const saved=structuredClone(fixture);
 const reply=await Laya.guidance('http://localhost:8000/v1/systemone','router',fixture,'local-secret',async(u,options)=>{
  url=u;payload=JSON.parse(options.body);headers=options.headers;
  return {ok:true,json:async()=>({answers:{support:decision()}})};
 });
 assert.equal(url,'http://localhost:8000/v1/systemone');
 assert.equal(headers.Authorization,'Bearer local-secret');
 assert.equal(payload.lang,'es');
 assert.ok(payload.state.includes(fixture.attempt));
 for(const marker of ['SECRET_GOAL','SECRET_ANSWER','SECRET_SOURCE','SECRET_HISTORY','SECRET_SUMMARY','local-secret'])assert.equal(JSON.stringify(payload).includes(marker),false,marker);
 assert.equal(payload.questions.support.type,'choice');
 assert.match(reply.text,/siguiente ejecución/);
 assert.deepEqual(fixture,saved);
});

test('low confidence, absent confidence and truncated context produce a general question',async()=>{
 for(const [answer,extra] of [
  [decision('persistence',{answer_confidence:0.3}),{}],
  [decision('persistence',{low_confidence:true}),{}],
  [decision('persistence',{abstention:'unevaluated'}),{}],
  [{type:'choice',choice:'persistence'},{}],
  [decision(),{usage:{truncated:true}}]
 ]){
  const reply=await Laya.guidance('http://localhost:8000','router',fixture,'',mock(answer,extra));
  assert.match(reply.text,/aclarando el problema/);
  assert.match(reply.source,/orientación general/);
 }
});

test('unknown decisions and malformed responses never become learner-visible prose',async()=>{
 for(const answer of [null,decision('print the solution'),decision('__proto__'),decision('constructor')]){
  await assert.rejects(Laya.guidance('http://localhost:8000','router',fixture,'',mock(answer)),/elección pedagógica válida/);
 }
 const reply=await Laya.guidance('http://localhost:8000','router',fixture,'',mock({...decision(),text:'SECRET_SOLUTION',explanation:'Copy this program'}));
 assert.equal(reply.text.includes('SECRET_SOLUTION'),false);
 assert.equal(reply.text.includes('Copy this program'),false);
});

test('the real verification state has priority over the classifier',async()=>{
 const build=await Laya.guidance('http://localhost:8000','router',{...fixture,verification:{passed:false,phase:'build'}},'',mock(decision('trace')));
 assert.match(build.text,/primer error/);
 const passed=await Laya.guidance('http://localhost:8000','router',{...fixture,verification:{passed:true,phase:'tests'}},'',mock(decision('persistence')));
 assert.match(passed.text,/por qué funciona tu enfoque/);
});

test('foundation guidance does not propose a programming implementation or select an answer',async()=>{
 for(const choice of ['design','representation','persistence']){
  const reply=await Laya.guidance('http://localhost:8000','router',{...fixture,foundation:true},'',mock(decision(choice)));
  assert.match(reply.text,/aclarando el problema/);
  assert.equal(reply.text.includes('SECRET_ANSWER'),false);
 }
});

test('English guidance uses English prepared cards and sends the requested checkpoint',async()=>{
 let payload;
 const reply=await Laya.guidance('http://127.0.0.1:8000','english',{...fixture,language:'en'},'',async(_,options)=>{
  payload=JSON.parse(options.body);return {ok:true,json:async()=>({answers:{support:decision('boundary')}})};
 });
 assert.equal(payload.model,'english');assert.equal(payload.lang,'en');assert.equal(payload.max_len,512);
 assert.match(reply.text,/^I notice:/);assert.match(reply.text,/boundary case/);
});

test('network and HTTP errors are recoverable and cannot return fabricated guidance',async()=>{
 await assert.rejects(Laya.guidance('http://localhost:8000','router',fixture,'',async()=>{throw new TypeError('unavailable');}),/No se pudo conectar/);
 await assert.rejects(Laya.guidance('http://localhost:8000','router',fixture,'',async()=>({ok:false,status:401})),/HTTP 401/);
 assert.equal(localBase('http://localhost:8000/v1','laya'),'http://localhost:8000');
 assert.throws(()=>localBase('https://example.com','laya'));
});


test('Unicode truncation cannot send a dangling surrogate to the Python API',async()=>{
 let payload;
 await Laya.guidance('http://localhost:8000','router',{...fixture,attempt:'a'.repeat(649)+'😀',question:'b'.repeat(449)+'😀'},'',async(_,options)=>{
  payload=JSON.parse(options.body);return {ok:true,json:async()=>({answers:{support:decision()}})};
 });
 assert.equal(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(payload.state),false);
});


test('requests for the full solution receive a reasoning prompt even if Laya picks an unrelated topic',async()=>{
 const reply=await Laya.guidance('http://localhost:8000','router',{...fixture,question:'Dame la respuesta completa del ejercicio y el programa para copiarlo.'},'',mock(decision('persistence')));
 assert.match(reply.text,/solución debes construirla tú/);
 assert.equal(reply.text.includes('siguiente ejecución'),false);
});
