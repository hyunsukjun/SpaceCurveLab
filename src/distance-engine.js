import { distanceRoomGains } from "./spatial-parameters.js?v=20260927-04";

export function createDistanceProcessor(context, input, output, impulseBuffer) {
  const bypassGain = context.createGain();
  const directGain = context.createGain();
  const lowpass = context.createBiquadFilter();
  const wetGain = context.createGain();
  const convolver = context.createConvolver();

  lowpass.type = "lowpass";
  lowpass.Q.value = 0.45;
  convolver.buffer = impulseBuffer;

  input.connect(bypassGain);
  bypassGain.connect(output);
  input.connect(directGain);
  directGain.connect(lowpass);
  lowpass.connect(output);
  input.connect(wetGain);
  wetGain.connect(convolver);
  convolver.connect(output);

  return {
    update(distance, bypass, time = context.currentTime, immediate = false) {
      const safeDistance = clamp(distance, 0, 1);
      const mix = distanceRoomGains(bypass ? 0 : safeDistance);
      const bypassLevel = bypass ? 1 : 0;
      const direct = bypass ? 0 : (1 - safeDistance * 0.48) * mix.dry;
      const cutoff = 19000 - safeDistance * 9500;
      const wet = mix.wet * 0.4;
      if (immediate) {
        bypassGain.gain.setValueAtTime(bypassLevel, time);
        directGain.gain.setValueAtTime(direct, time);
        lowpass.frequency.setValueAtTime(cutoff, time);
        wetGain.gain.setValueAtTime(wet, time);
        return;
      }
      bypassGain.gain.setTargetAtTime(bypassLevel, time, 0.02);
      directGain.gain.setTargetAtTime(direct, time, 0.035);
      lowpass.frequency.setTargetAtTime(cutoff, time, 0.045);
      wetGain.gain.setTargetAtTime(wet, time, 0.06);
    },
    disconnect() {
      input.disconnect();
      bypassGain.disconnect();
      directGain.disconnect();
      lowpass.disconnect();
      wetGain.disconnect();
      convolver.disconnect();
    }
  };
}

export function makeSmallRoomImpulse(context, seconds = 1.15) {
  const length = Math.max(1, Math.floor(context.sampleRate * seconds));
  const impulse = context.createBuffer(2, length, context.sampleRate);
  const random = seededRandom(19790217);
  for (let channel = 0; channel < 2; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      const t = i / length;
      const early = i < context.sampleRate * 0.08 ? 1 : 0.35;
      const decay = Math.pow(1 - t, 2.8);
      data[i] = (random() * 2 - 1) * decay * early * 0.28;
    }
  }
  return impulse;
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
