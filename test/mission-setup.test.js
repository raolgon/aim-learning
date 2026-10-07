'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const Setup=require('../src/mission-setup');
test('el diagnóstico consulta versiones sin ejecutar ejercicios ni instalar herramientas',async()=>{
 const calls=[];
 const run=async(program,args,options)=>{calls.push({program,args,options});return {code:0,output:'8.0.401\n'};};
 const report=await Setup.diagnose('csharp',{dotnetPath:'dotnet-fixture'},{execute:run,cwd:'fixture'});
 assert.equal(report.ready,true);assert.equal(report.version,'8.0.401');assert.equal(calls.length,1);assert.deepEqual(calls[0].args,['--version']);assert.equal(calls[0].options.cwd,'fixture');
 for(const output of ['7.0.100','No SDK found'])assert.equal((await Setup.diagnose('csharp',{}, {execute:async()=>({code:0,output})})).ready,false);
 assert.equal((await Setup.diagnose('csharp',{}, {execute:async()=>({code:null,output:''})})).ready,false);
});
test('cada ruta distingue una herramienta compatible de una respuesta ajena',async()=>{
 for(const [track,version] of [['cpp','g++ (GCC) 13.2.0'],['cpp','clang version 18.1.0'],['python','Python 3.12.0'],['javascript','v22.0.0']]){
  assert.equal((await Setup.diagnose(track,{}, {execute:async()=>({code:0,output:version})})).ready,true);
  assert.equal((await Setup.diagnose(track,{}, {execute:async()=>({code:0,output:'Unknown command'})})).ready,false);
 }
 assert.notEqual(Setup.signature('csharp',{dotnetPath:'A'}),Setup.signature('csharp',{dotnetPath:'B'}));
 assert.notEqual(Setup.signature('cpp',{},'win32'),Setup.signature('cpp',{},'linux'));
 assert.equal(Setup.runtimeLabel('linux',true),'WSL · Linux');
});
test('el recorrido exige carpeta, permiso, herramienta y terminal antes del primer archivo',()=>{
 let options={};assert.equal(Setup.stage(options),'folder');
 options.workspace=true;assert.equal(Setup.stage(options),'trust');
 options.trusted=true;assert.equal(Setup.stage(options),'tools');
 options.report={ready:false};assert.equal(Setup.stage(options),'tools');
 options.report.ready=true;assert.equal(Setup.stage(options),'terminal');
 options.terminalReady=true;assert.equal(Setup.stage(options),'files');
 options.exists=true;assert.equal(Setup.stage(options),'ready');
});

test('C++ no se declara preparado si el compilador no admite C++17',async()=>{
 const calls=[];const report=await Setup.diagnose('cpp',{}, {execute:async(program,args,options)=>{calls.push({args,options});return args[0]==='--version'?{code:0,output:'g++ (GCC) 5.1.0'}:{code:1,stderr:'Unsupported standard'};}});
 assert.equal(report.ready,false);assert.deepEqual(calls[1].args,['-std=c++17','-x','c++','-fsyntax-only','-']);assert.ok(calls[1].options.input);assert.equal(calls.length,2);
});
