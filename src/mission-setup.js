'use strict';
const {execute, runtimeFor}=require('./runner');
const crypto=require('node:crypto');
const os=require('node:os');
function signature(track, tools={}, platform=process.platform){return crypto.createHash('sha256').update(JSON.stringify([track,platform,track==='cpp'?tools.cppCompiler||'g++':runtimeFor(track,tools)])).digest('hex');}
function runtimeLabel(platform=process.platform,wsl=Boolean(process.env.WSL_DISTRO_NAME)){return platform==='win32'?'Windows':platform==='darwin'?'macOS':wsl?'WSL · Linux':'Linux';}
function stage({workspace,trusted,report,terminalReady,exists}) {return !workspace?'folder':!trusted?'trust':!report?.ready?'tools':!terminalReady?'terminal':exists?'ready':'files';}
async function diagnose(track,tools={},options={}){
 const platform=options.platform||process.platform,run=options.execute||execute;
 const program=track==='cpp'?tools.cppCompiler||'g++':runtimeFor(track,tools);
 const result=await run(program,['--version'],{cwd:options.cwd||os.tmpdir(),timeout:15000,signal:options.signal});
 const version=String(result.output||result.stderr||'').trim().split(/\r?\n/)[0].slice(0,160);
 let ready=result.code===0&&(track==='csharp'?Number(/^(\d+)\./.exec(version)?.[1])>=8:track==='python'?/^Python 3\./.test(version):track==='javascript'?/^v\d+\./.test(version):/g\+\+|gcc|clang/i.test(version));
 if (ready && track==='cpp') {
  const syntax=await run(program,['-std=c++17','-x','c++','-fsyntax-only','-'],{cwd:options.cwd||os.tmpdir(),timeout:15000,signal:options.signal,input:'#include <optional>\nint main() { std::optional<int> value; return value.has_value(); }\n'});
  ready=syntax.code===0;
 }
 return {ready,program,version:result.code===0?version:'',signature:signature(track,tools,platform),checkedAt:new Date().toISOString(),detail:ready?'La herramienta está disponible en esta ventana de VS Code.':'La herramienta necesaria no está disponible o su versión no es compatible.'};
}
module.exports={signature,runtimeLabel,stage,diagnose};
