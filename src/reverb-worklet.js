import { SpaceReverb } from './reverb-core.js?v=20261014-room2';
class SpaceRoomProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{name:'send', defaultValue:0, minValue:0, maxValue:1, automationRate:'a-rate'},
      {name:'active', defaultValue:1, minValue:0, maxValue:1, automationRate:'a-rate'},
      {name:'decay', defaultValue:1.2, minValue:0.3, maxValue:4, automationRate:'k-rate'}];
  }
  constructor() { super(); this.room = new SpaceReverb(sampleRate, 2); }
  process(inputs, outputs, parameters) {
    this.room.setDecay(parameters.decay[0]);
    const input = inputs[0], output = outputs[0];
    for (let i = 0; i < output[0].length; i++) {
      const send = parameters.send.length === 1 ? parameters.send[0] : parameters.send[i];
      const wet = this.room.process((input[0]?.[i] || 0) * send, (input[1]?.[i] || 0) * send);
      for (let c = 0; c < output.length; c++) output[c][i] = wet[c] * (parameters.active.length === 1 ? parameters.active[0] : parameters.active[i]);
    }
    return true;
  }
}
registerProcessor('space-room', SpaceRoomProcessor);
