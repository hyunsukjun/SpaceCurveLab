import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {SpaceReverb, roomSend} from '../src/reverb-core.js';
import {renderSpatialWav} from '../src/offline-render.js';
let cases = 0;
for (const rate of [44100,48000,96000]) for (const decay of [.3,1.2,4]) for (const channels of [2,4,8]) {
  const room = new SpaceReverb(rate,channels,decay);
  let energy = 0, late = 0, peak = 0;
  for(let i=0;i<rate*6;i++) {
    const y = room.process(i===0?1:0,i===0?-1:0);
    for(const x of y) { assert(Number.isFinite(x));energy+=x*x;peak=Math.max(peak,Math.abs(x)); if(i>rate*5) late+=x*x; }
  }
  assert(energy>1e-5,'anti-phase stereo must excite room'); assert(peak<1); assert(late/energy<1e-6,'tail must decay'); cases++;
}
// Actual worklet wrapper must produce the same wet samples as the shared core.
let Processor;
vm.runInNewContext(fs.readFileSync(new URL('../src/reverb-worklet.js',import.meta.url),'utf8').replace(/^import .*\n/,''),{
  SpaceReverb, AudioWorkletProcessor:class {}, sampleRate:48000,
  registerProcessor:(name,cls)=>{Processor=cls;}
});
const worklet = new Processor(), reference = new SpaceReverb(48000,2,1.2);
for(let block=0;block<100;block++) {
  const left=Float32Array.from({length:128},(_,i)=>Math.sin((block*128+i)*.1)*.1);
  const right=Float32Array.from(left,v=>-v*.7), out=[new Float32Array(128),new Float32Array(128)];
  worklet.process([[left,right]],[out],{send:new Float32Array([.5]),decay:new Float32Array([1.2]),active:new Float32Array([1])});
  for(let i=0;i<128;i++) {const y=reference.process(left[i]*.5,right[i]*.5);for(let c=0;c<2;c++) assert(Math.abs(out[c][i]-y[c])<1e-8);}
}
assert.equal(roomSend({enabled:true,amount:.4,linked:true},0),0);
assert.equal(roomSend({enabled:true,amount:.4,linked:false},0),.4);
assert.equal(roomSend({enabled:false,amount:1,linked:false},1),0);
const rate=48000,n=rate/2,flat=y=>[{x:0,y},{x:1,y}];
const left=Float32Array.from({length:n},(_,i)=>i<rate/10?.7*Math.sin(i*.1):0);
const buffer={sampleRate:rate,length:n,numberOfChannels:2,getChannelData:c=>c?Float32Array.from(left,x=>-x):left};
for(const format of ['stereo','quad','octo'])for(const bypass of [false,true])for(const linked of [false,true]) {
 const wav=renderSpatialWav(buffer,flat(.5),flat(1),format,bypass,{enabled:true,amount:1,decay:4,linked});
 const v=new DataView(wav),channels={stereo:2,quad:4,octo:8}[format];
 assert.equal(v.getUint16(22,true),channels);assert.equal(v.getUint16(34,true),24);assert.equal(v.getUint32(40,true),n*channels*3);
 for(let k=44;k<wav.byteLength;k+=3){let x=v.getUint8(k)|(v.getUint8(k+1)<<8)|(v.getUint8(k+2)<<16);if(x&8388608)x-=16777216;assert(Math.abs(x/8388608)<=.980001);}
}
console.log(`PASS ${cases} impulse decay cases; 12800-frame worklet/core parity; send semantics; 12 stereo/quad/octo export cases`);
// Reverb curve is independent of Distance and uses normalized smoothstep.
const rise=[{x:0,y:0},{x:1,y:1}];
for(const distance of [0,.5,1]) {
  assert.equal(roomSend({enabled:true,amountCurve:rise,linked:false},distance,0),0);
  assert.equal(roomSend({enabled:true,amountCurve:rise,linked:false},distance,.5),.5);
  assert.equal(roomSend({enabled:true,amountCurve:rise,linked:false},distance,1),1);
}
for(const format of ['stereo','quad','octo']) {
 const off=renderSpatialWav(buffer,flat(.5),flat(.5),format,false,{enabled:false});
 const zero=renderSpatialWav(buffer,flat(.5),flat(.5),format,false,{enabled:true,amountCurve:flat(0),decay:1.2});
 assert.deepEqual(new Uint8Array(zero),new Uint8Array(off),'zero curve equals reverb off');
 const varying=renderSpatialWav(buffer,flat(.5),flat(.5),format,false,{enabled:true,amountCurve:rise,decay:1.2});
 assert.notDeepEqual(new Uint8Array(varying),new Uint8Array(off),'curve reaches offline room input');
}
console.log('PASS Reverb curve interpolation, Distance independence, zero/off equivalence and moving-curve output in 2/4/8ch');
// Dynamic send automation, including a zero-send interval, through the real wrapper.
const movingProcessor=new Processor(), movingReference=new SpaceReverb(48000,2,1.2);
for(let block=0;block<400;block++) {
 const l=Float32Array.from({length:128},(_,i)=>.2*Math.sin((block*128+i)*.13));
 const r=Float32Array.from(l,v=>-v);
 const send=Float32Array.from({length:128},(_,i)=>block>220?0:roomSend({enabled:true,amountCurve:rise},0,(block*128+i)/51200));
 const out=[new Float32Array(128),new Float32Array(128)];
 movingProcessor.process([[l,r]],[out],{send,decay:new Float32Array([1.2]),active:new Float32Array([1])});
 for(let i=0;i<128;i++){const y=movingReference.process(l[i]*send[i],r[i]*send[i]);for(let c=0;c<2;c++)assert(Math.abs(out[c][i]-y[c])<1e-8);}
}
console.log('PASS 51200-frame moving/zero-send worklet parity, including remaining tail');
