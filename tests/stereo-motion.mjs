import assert from 'node:assert/strict';
import {renderSpatialWav} from '../src/offline-render.js';
const rate=48000,seconds=4,n=rate*seconds,flat=y=>[{x:0,y},{x:1,y}];
const rows=[];
for(const hz of [80,997,10000])for(const phase of [0,Math.PI/2,Math.PI])for(const distance of [0,1])for(const clockwise of [true,false]){
 const left=Float32Array.from({length:n},(_,i)=>.1*Math.sin(2*Math.PI*hz*i/rate));
 const right=Float32Array.from(left,(_,i)=>.1*Math.sin(2*Math.PI*hz*i/rate+phase));
 const buffer={sampleRate:rate,length:n,numberOfChannels:2,getChannelData:c=>c?right:left};
 const direction=clockwise?[{x:0,y:.5},{x:1,y:.6}]:[{x:0,y:.6},{x:1,y:.5}];
 const wav=renderSpatialWav(buffer,direction,flat(distance),'stereo',false),v=new DataView(wav);
 assert.equal(v.getUint32(40,true),n*6);assert.equal(v.getUint32(24,true),rate);assert.equal(v.getUint16(34,true),24);
 const rms=[];let peak=0;
 for(let start=4800;start<n-4800;start+=2400){let energy=0;for(let i=start;i<start+2400;i++)for(let c=0;c<2;c++){const k=44+i*6+c*3;let x=v.getUint8(k)|(v.getUint8(k+1)<<8)|(v.getUint8(k+2)<<16);if(x&8388608)x-=16777216;x/=8388608;energy+=x*x;peak=Math.max(peak,Math.abs(x));}rms.push(Math.sqrt(energy/2400));}
 const min=Math.min(...rms),max=Math.max(...rms);assert(min>.003,'no near-silent 50ms window');assert(peak<=.980001);
 rows.push({hz,phase,distance,clockwise,minRms:min,maxRms:max,windowSpanDb:20*Math.log10(max/min),peak});
}
console.log(JSON.stringify({cases:rows.length,windowMs:50,edgeExclusionMs:100,rows},null,2));
