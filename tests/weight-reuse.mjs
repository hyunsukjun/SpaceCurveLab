import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const fixtures=JSON.parse(readFileSync(new URL('./weight-reuse-fixtures.json',import.meta.url))); 
import {renderSpatialWav as after} from '../src/offline-render.js';
const rows=[];
for(const count of [1,2])for(const format of ['stereo','quad','octo'])for(const bypass of [false,true])for(const moving of [false,true]){
 const sampleRate=48000,length=24000,channels=Array.from({length:count},(_,c)=>{const a=new Float32Array(length);for(let i=0;i<length;i++)a[i]=(i%997===0?.8:0)+.45*Math.sin((c+1)*331*2*Math.PI*i/sampleRate);return a});
 const input={sampleRate,length,numberOfChannels:count,getChannelData:c=>channels[c]};
 const direction=moving?[{x:0,y:0},{x:.2,y:1},{x:.55,y:.37},{x:1,y:.8}]:[{x:0,y:.5},{x:1,y:.5}];
 const distance=moving?[{x:0,y:0},{x:.4,y:1},{x:1,y:.2}]:[{x:0,y:1},{x:1,y:1}];
 const b=Buffer.from(after(input,direction,distance,format,bypass));const sha256=createHash('sha256').update(b).digest('hex');const expected=fixtures.find(x=>x.count===count&&x.format===format&&x.bypass===bypass&&x.moving===moving);assert.equal(sha256,expected.sha256,JSON.stringify(expected));
 rows.push({count,format,bypass,moving,sha256});
}
console.log(`PASS ${rows.length} baseline WAV fixtures (9c316a9)`);
