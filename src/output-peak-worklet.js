import {OutputPeakGuard} from './output-peak-guard.js';
class OutputPeakProcessor extends AudioWorkletProcessor {
  constructor() { super(); this.guard=new OutputPeakGuard(sampleRate); this.failed=false; }
  process(inputs, outputs) {
    if (this.failed) return true;
    const input=inputs[0]||[],output=outputs[0];
    if (!output?.length) return true;
    for (let i=0;i<output[0].length;i++) {
      let peak=0;
      for(let c=0;c<output.length;c++) peak=Math.max(peak,Math.abs(input[c]?.[i]??0));
      if(!Number.isFinite(peak)) {
        for(const channel of output) channel.fill(0);
        this.failed=true;this.port.postMessage({type:'invalid-output'});return true;
      }
      const gain=this.guard.gainForPeak(peak);
      for(let c=0;c<output.length;c++) output[c][i]=(input[c]?.[i]??0)*gain;
    }
    return true;
  }
}
registerProcessor('space-output-peak-guard',OutputPeakProcessor);
