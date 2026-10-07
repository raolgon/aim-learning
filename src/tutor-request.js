'use strict';
function cancelled() { const error=new Error('Consulta cancelada. Tu mensaje sigue disponible para volver a intentarlo.');error.code='TUTOR_CANCELLED';return error; }
function throwIfCancelled(signal) { if(signal?.aborted) throw cancelled(); }
function abortable(promise,signal) {
 if(!signal)return promise;
 return new Promise((resolve,reject)=>{
  const stop=()=>reject(cancelled());
  const finish=fn=>value=>{signal.removeEventListener('abort',stop);fn(value)};
  Promise.resolve(promise).then(finish(resolve),finish(reject));
  if(signal.aborted)stop();else signal.addEventListener('abort',stop,{once:true});
 });
}
function linkAbort(signal,controller) { const stop=()=>controller.abort();if(signal?.aborted)stop();else signal?.addEventListener('abort',stop,{once:true});return ()=>signal?.removeEventListener('abort',stop); }
module.exports={cancelled,throwIfCancelled,abortable,linkAbort};
