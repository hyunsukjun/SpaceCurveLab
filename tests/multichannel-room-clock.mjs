import assert from 'node:assert/strict';
import {renderSpatialWav} from '../src/offline-render.js';
const rate=48000,n=rate/2,impulse=960;
const signal=new Float32Array(n);signal[impulse]=.1;const zero=new Float32Array(n);
const flat=y=>[{x:0,y},{x:1,y}],angle=d=>flat((d+1800)/3600);
const buffer=channels=>({sampleRate:rate,length:n,numberOfChannels:channels.length,getChannelData:c=>channels[c]});
function samples(wav){const v=new DataView(wav),ch=v.getUint16(22,true);return Array.from({length:ch},(_,c)=>Float32Array.from({length:n},(_,i)=>{const k=44+(i*ch+c)*3;let x=v.getUint8(k)|(v.getUint8(k+1)<<8)|(v.getUint8(k+2)<<16);if(x&8388608)x-=16777216;return x/8388608;}));}
function onset(a){for(let i=impulse+480;i<n;i++)if(a.some(ch=>Math.abs(ch[i])>1e-5))return (i-impulse)/rate*1000;return null;}
const rows=[];
for(const format of ['quad','octo'])for(const side of ['left','right']){
 const mono=renderSpatialWav(buffer([signal]),angle(0),flat(1),format,false);
 const stereo=renderSpatialWav(buffer(side==='left'?[signal,zero]:[zero,signal]),angle(side==='left'?45:-45),flat(1),format,false);
 const a=samples(mono),b=samples(stereo);let max=0;for(let c=0;c<a.length;c++)for(let i=0;i<n;i++)max=Math.max(max,Math.abs(a[c][i]-b[c][i]));
 const row={format,side,monoFirstReflectionMs:onset(a),stereoFirstReflectionMs:onset(b),maxDifference:max};rows.push(row);
 if(!process.argv.includes('--probe')){assert.equal(row.stereoFirstReflectionMs,43);assert.equal(max,0,'silent companion channel must not change room timing or PCM');}
}
console.log(JSON.stringify(rows,null,2));
