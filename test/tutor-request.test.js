'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {abortable}=require('../src/tutor-request');const Local=require('../src/local-models'),Tutor=require('../src/tutor');
test('cancelar el transporte local descarta resultados tardíos aunque el servidor ignore la señal',async()=>{
 const controller=new AbortController();let release,transportSignal;
 const pending=Local.sendLocal('ollama','http://localhost:11434','fixture',{language:'es'},async(u,options)=>{transportSignal=options.signal;return new Promise(resolve=>release=resolve);},controller.signal);
 controller.abort();await assert.rejects(pending,{code:'TUTOR_CANCELLED'});assert.equal(transportSignal.aborted,true);
 release({ok:true,json:async()=>({message:{content:'late'}})});
});
test('cancelar OpenAI durante la lectura del cuerpo conserva el tipo de cancelación',async()=>{
 const controller=new AbortController();let bodyStarted;const ready=new Promise(resolve=>bodyStarted=resolve);
 const pending=Tutor.sendOpenAI('fixture-key','fixture-model',{language:'es'},async()=>({ok:true,json:()=>{bodyStarted();return new Promise(()=>{});}}),controller.signal);
 await ready;controller.abort();await assert.rejects(pending,{code:'TUTOR_CANCELLED'});
});
test('un timeout local sigue siendo un error de espera y no una cancelación voluntaria',async()=>{
 await assert.rejects(Local.requestJson('http://localhost:11434',{},()=>new Promise(()=>{}),5),error=>error.code!=='TUTOR_CANCELLED' && /tardó demasiado/.test(error.message));
});
test('una operación cancelada no acepta un resultado tardío ni deja rechazos sin atender',async()=>{
 const controller=new AbortController();controller.abort();
 await assert.rejects(abortable(Promise.reject(new Error('late rejection')),controller.signal),{code:'TUTOR_CANCELLED'});
 assert.equal(await abortable(Promise.resolve('ok'),new AbortController().signal),'ok');
});
