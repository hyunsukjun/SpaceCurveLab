import {BOUNDARY_SECONDS} from './playback-boundary.js';

const envelopes = new WeakMap();
const PEAK_GAIN = 0.9;

export function previewGainAt(param, time) {
  const envelope = envelopes.get(param);
  if (!envelope) return Math.max(0, Number(param.value) || 0);
  if (time <= envelope.start) return envelope.initial;
  if (time >= envelope.end) return 0;
  if (envelope.release) return envelope.initial * (envelope.end - time) / (envelope.end - envelope.start);
  const age = time - envelope.start;
  return PEAK_GAIN * Math.max(0, Math.min(1, age / envelope.fade, (envelope.end - time) / envelope.fade));
}

export function schedulePreviewEnvelope(param, startTime, duration) {
  const fade = Math.min(BOUNDARY_SECONDS, Math.max(0, duration) * 0.5);
  envelopes.set(param, {start:startTime, end:startTime + Math.max(0, duration), fade, initial:0, release:false});
  param.cancelScheduledValues(startTime);
  param.setValueAtTime(0, startTime);
  param.linearRampToValueAtTime(PEAK_GAIN, startTime + fade);
  if (duration > fade * 2) param.setValueAtTime(PEAK_GAIN, startTime + duration - fade);
  param.linearRampToValueAtTime(0, startTime + Math.max(0, duration));
}

export function releasePreviewEnvelope(param, time) {
  // Evaluate our scheduled envelope, rather than depending on a possibly stale getter.
  const initial = previewGainAt(param, time);
  const previous = envelopes.get(param);
  const end = Math.max(time, Math.min(time + BOUNDARY_SECONDS, previous?.end ?? Infinity));
  param.cancelAndHoldAtTime(time);
  // A new linear ramp needs this explicit current-time event, including on a plateau.
  param.setValueAtTime(initial, time);
  if (end > time) param.linearRampToValueAtTime(0, end);
  else param.setValueAtTime(0, time);
  envelopes.set(param, {start:time, end, initial, release:true});
  return {startGain:initial, endTime:end};
}
