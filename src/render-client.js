// Keep the synchronous DSP implementation as the deterministic reference.
// A disposable worker keeps UI responsive and makes cancellation definitive.
export function renderSpatialWavAsync(buffer,direction,distance,format,bypassed,signal) {
  return new Promise((resolve,reject)=>{
    if(signal?.aborted){reject(new DOMException('Render cancelled','AbortError'));return;}
    let worker;
    const cleanup=()=>{signal?.removeEventListener('abort',abort);worker?.terminate();};
    const fail=error=>{cleanup();reject(error);};
    const abort=()=>fail(new DOMException('Render cancelled','AbortError'));
    try {
      worker=new Worker(new URL('./render-worker.js?v=20261006-worker-01',import.meta.url),{type:'module'});
      signal?.addEventListener('abort',abort,{once:true});
      worker.onmessage=({data})=>{cleanup();if(data.error)reject(new Error(data.error));else resolve(data.wav);};
      worker.onerror=event=>{event.preventDefault();fail(new Error(event.message || 'Render worker failed'));};
      // Structured clone preserves the original AudioBuffer used by Preview.
      const channels=Array.from({length:Math.min(2,buffer.numberOfChannels)},(_,c)=>buffer.getChannelData(c));
      worker.postMessage({channels,sampleRate:buffer.sampleRate,direction,distance,format,bypassed});
    } catch(error){fail(error);}
  });
}
