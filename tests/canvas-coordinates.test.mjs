import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const names=['clamp','pointerToPoint','canvasToCurve','curveToCanvas','valueToY','directionValueFromCanvas','directionYFromValue','directionValue'];
const functions=names.map(name=>{const a=source.indexOf(`function ${name}(`);assert(a>=0);return source.slice(a,source.indexOf('\n}',a)+2)}).join('\n');
for(const mode of ['direction','distance','reverb']) test(`${mode}: resize preserves normalized curve and pointer coordinates`,()=>{
 for(const [width,height] of [[1010,235],[500,300],[320,220]]){
  const ctx={canvasSizes:{curve:{width,height}},axisWidth:104,plotPaddingTop:18,plotPaddingBottom:24,activeCurve:mode,curveCanvas:{getBoundingClientRect:()=>({left:20,top:200,width,height})}};
  vm.createContext(ctx);vm.runInContext(functions,ctx);
  for(const x of [0,.25,.5,1]) for(const y of [0,.1,.5,1]){
   const screen=ctx.curveToCanvas({x,y});
   const pointer=ctx.pointerToPoint({clientX:screen.x+20,clientY:screen.y+200});
   const result=ctx.canvasToCurve(pointer.x,pointer.y);
   assert(Math.abs(result.x-x)<1e-10);assert(Math.abs(result.y-y)<1e-10);
  }
 }
});
