import assert from 'node:assert/strict';
import {schedulePreviewEnvelope,releasePreviewEnvelope,previewGainAt} from '../src/preview-envelope.js';
class Param {
  value=123;events=[];
  cancelScheduledValues(t){this.events.push(['cancel',t]);}
  cancelAndHoldAtTime(t){this.events.push(['hold',t]);}
  setValueAtTime(v,t){this.events.push(['set',v,t]);}
  linearRampToValueAtTime(v,t){this.events.push(['ramp',v,t]);}
}
const close=(a,b)=>assert(Math.abs(a-b)<1e-11,`${a} vs ${b}`);
for(const [at,gain,end]of[[.002,.18,.012],[.01,.9,.02],[.3,.9,.31],[.995,.45,1],[1,0,1]]){
 const p=new Param();schedulePreviewEnvelope(p,0,1);close(previewGainAt(p,at),gain);const r=releasePreviewEnvelope(p,at);close(r.startGain,gain);close(r.endTime,end);
 const anchor=p.events.findLast(e=>e[0]==='set'&&e[2]===at);close(anchor[1],gain);
 close(previewGainAt(p,(at+end)/2),gain/2);close(previewGainAt(p,end),0);
 assert(r.startGain<=.9,'do not use stale AudioParam.value123');
}
{
 const p=new Param();schedulePreviewEnvelope(p,0,1);releasePreviewEnvelope(p,.3);const r=releasePreviewEnvelope(p,.304);close(r.startGain,.54);close(r.endTime,.31);close(previewGainAt(p,.31),0);
 schedulePreviewEnvelope(p,.4,.6);close(previewGainAt(p,.4),0);close(previewGainAt(p,.405),.45);close(previewGainAt(p,.41),.9);
}
for(const length of [0,.0005,.005,.01,.02]){
 const p=new Param();schedulePreviewEnvelope(p,0,length);for(const t of [0,length*.2,length*.5,length]){const g=previewGainAt(p,t);assert(Number.isFinite(g)&&g>=0&&g<=.9);}
 const r=releasePreviewEnvelope(p,length*.3);assert(r.endTime<=length+1e-15);close(previewGainAt(p,length),0);
}
{
 const old=new Param(),next=new Param();schedulePreviewEnvelope(old,0,2);releasePreviewEnvelope(old,1);schedulePreviewEnvelope(next,1,2);
 for(let i=0;i<=100;i++)close(previewGainAt(old,1+i/10000)+previewGainAt(next,1+i/10000),.9);
}
console.log('PASS explicit gain/time anchors across attack/plateau/natural release/short output/repeated release/resume and independent seek graphs');
