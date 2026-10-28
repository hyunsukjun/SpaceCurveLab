import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const start=source.indexOf('function stopPlaybackNodes(');
const code=source.slice(start,source.indexOf('\n}',start)+2);
let newPlaybackStopped=0;
const oldSource={disconnect(){},stop(){queueMicrotask(()=>this.onended?.());}};
const c={source:oldSource,panners:[],distanceProcessors:[],previewMaster:null,roomNode:null,rafId:null,
 cancelAnimationFrame(){},setTimeout,playbackOwner:'old'};
oldSource.onended=()=>{if(c.playbackOwner==='new')newPlaybackStopped++;};
vm.createContext(c);vm.runInContext(code,c);
c.stopPlaybackNodes(false);
c.playbackOwner='new';
await new Promise(resolve=>setImmediate(resolve));
assert.equal(newPlaybackStopped,0,'retired source end must not cancel a new Play after paused seek');
assert.equal(oldSource.onended,null);
console.log('PASS retired source end callback cannot stop new playback');
