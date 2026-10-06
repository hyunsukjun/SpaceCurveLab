import assert from 'node:assert/strict';
import {prepareRenderBuffer} from '../src/render-preparation.js';
const input=new Float32Array(96000*5),buffer={sampleRate:96000,numberOfChannels:1,getChannelData:()=>input};
const controller=new AbortController();setTimeout(()=>controller.abort(),0);
await assert.rejects(prepareRenderBuffer(buffer,48000,controller.signal),{name:'AbortError'});
const pre=new AbortController();pre.abort();await assert.rejects(prepareRenderBuffer({sampleRate:48000},48000,pre.signal),{name:'AbortError'});
console.log('Preparation cancellation and pre-abort pass');
