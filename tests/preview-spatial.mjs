import assert from 'node:assert/strict';
import {createPreviewPosition, prepareHrtf} from '../src/preview-spatial.js';
class Param {
  events=[];
  cancelScheduledValues(t){this.events.push(['cancel',t]);}
  cancelAndHoldAtTime(t){this.events.push(['hold',t]);}
  setValueAtTime(v,t){this.events.push(['set',v,t]);}
  setValueCurveAtTime(v,t,d){this.events.push(['curve',v,t,d]);}
}
const node=()=>({positionX:new Param(),positionY:new Param(),positionZ:new Param()});
for(const [from,to,r] of [[-90,90,1],[170,-170,4.5],[-1800,1800,1],[1800,-1800,4.5]]){
 const p=node(),position=createPreviewPosition(p);position(from,r,0,true);position(to,r,.01);
 const x=p.positionX.events.at(-1),z=p.positionZ.events.at(-1);
 assert.equal(x[0],'curve');assert.equal(x[3],.1);
 for(let i=1;i<x[1].length;i++)for(const u of [0,.5,1]){
  const xx=x[1][i-1]*(1-u)+x[1][i]*u,zz=z[1][i-1]*(1-u)+z[1][i]*u;
  assert(Number.isFinite(xx+zz));assert(Math.hypot(xx,zz)>=r*.9996,'no chord crossing through listener');
 }
 const end=(to+(from-to)*Math.exp(-.1/.025))*Math.PI/180;
 assert(Math.abs(x[1].at(-1)-Math.sin(end)*r)<1e-6,'25 ms angle response and accumulated turns retained');
}
const p=node(),position=createPreviewPosition(p);position(0,1,0,true);position(90,4.5,.01);position(-90,1,.02);
assert.equal(p.positionX.events.filter(e=>e[0]==='hold').length,1,'first curve uses original hold; later curves retire retained table');
assert(p.positionX.events.some(e=>e[0]==='cancel'&&e[1]===.01),'retire the previous active curve');
position(45,2,.03,true);position(90,2,.04);assert.equal(p.positionX.events.filter(e=>e[0]==='hold').length,2,'immediate reset discards old schedule bookkeeping');
let legacy;createPreviewPosition({setPosition(...v){legacy=v;}})(90,1,0,true);assert(Math.abs(legacy[0]-1)<1e-10);

let renders=0,resolveRender,fail=false;
globalThis.OfflineAudioContext=class {
 constructor(ch,n,rate){assert.equal(ch,2);assert.equal(rate,44100);}
 createPanner(){return {set panningModel(v){assert.equal(v,'HRTF');},connect(){return this;},disconnect(){}};}
 createBufferSource(){return {connect(){return this;},start(){},disconnect(){}};}
 createBuffer(){return {copyToChannel(){}};}
 startRendering(){renders++;if(fail)return Promise.reject(new Error('probe failure'));return new Promise(r=>resolveRender=r);}
};
const context={sampleRate:44100,createPanner(){return {disconnect(){}};}};
const a=prepareHrtf(context),b=prepareHrtf(context);assert.equal(a,b);assert.equal(renders,1);
resolveRender();await a;assert.equal(prepareHrtf(context),a);assert.equal(renders,1,'no repeated preparation per context');
const next={...context};fail=true;await assert.rejects(prepareHrtf(next));fail=false;const retry=prepareHrtf(next);resolveRender();await retry;assert.equal(renders,3,'failure can retry');
console.log('PASS preview HRTF preparation cache/retry; polar smoothing, full turns, radius, 25 ms response and legacy fallback');
