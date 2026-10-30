// Browser HRTF readiness and preview-only position smoothing. No source PCM is read.
const preparations = new WeakMap();
export function prepareHrtf(context) {
  if (preparations.has(context)) return preparations.get(context).promise;
  // Keep the live context's HRTF database referenced between fresh Play graphs.
  const keeper = context.createPanner();
  keeper.panningModel = 'HRTF';
  const entry = { keeper, promise: null };
  entry.promise = (async () => {
    const offline = new OfflineAudioContext(2, 256, context.sampleRate);
    const source = offline.createBufferSource();
    const panner = offline.createPanner();
    panner.panningModel = 'HRTF';
    const impulse = offline.createBuffer(1, 256, context.sampleRate);
    impulse.copyToChannel(new Float32Array([1]), 0);
    source.buffer = impulse;
    source.connect(panner).connect(offline.destination);
    source.start();
    try {
      // Offline rendering waits for its HRTF data; no fixed sleep or live preroll.
      await offline.startRendering();
    } finally {
      source.disconnect();
      panner.disconnect();
    }
  })().catch(error => {
    preparations.delete(context);
    keeper.disconnect();
    throw error;
  });
  preparations.set(context, entry);
  return entry.promise;
}

const TAU = 0.025;
const HORIZON = 0.1;
const STEPS = 64;
const toward = (value, target, elapsed) => target + (value - target) * Math.exp(-Math.max(0, elapsed) / TAU);

export function createPreviewPosition(node) {
  let state;
  const scheduled = new Map();
  const automated = node.positionX && node.positionY && node.positionZ;
  return (degrees, radius, time, immediate = false) => {
    if (!automated) {
      const angle = degrees * Math.PI / 180;
      node.setPosition?.(Math.sin(angle) * radius, 0, -Math.cos(angle) * radius);
      return;
    }
    if (!state || immediate) {
      scheduled.clear();
      state = { angle: degrees, radius, targetAngle: degrees, targetRadius: radius, time };
      for (const [param, value] of [[node.positionX, Math.sin(degrees * Math.PI / 180) * radius], [node.positionY, 0], [node.positionZ, -Math.cos(degrees * Math.PI / 180) * radius]]) {
        param.cancelScheduledValues(time);
        param.setValueAtTime(value, time);
      }
      return;
    }
    const angle = toward(state.angle, state.targetAngle, time - state.time);
    const currentRadius = toward(state.radius, state.targetRadius, time - state.time);
    if (degrees === state.targetAngle && radius === state.targetRadius && time < state.time + HORIZON * 0.5) return;
    state = { angle, radius: currentRadius, targetAngle: degrees, targetRadius: radius, time };
    // At most 3 degrees between vector samples, including the full +/-1800 range.
    const steps = Math.max(STEPS, Math.ceil(Math.abs(degrees - angle) * HORIZON / (TAU * 3)));
    const x = new Float32Array(steps + 1), z = new Float32Array(steps + 1);
    for (let i = 0; i <= steps; i++) {
      const elapsed = HORIZON * i / steps;
      const radians = toward(angle, degrees, elapsed) * Math.PI / 180;
      const r = toward(currentRadius, radius, elapsed);
      x[i] = Math.sin(radians) * r;
      z[i] = -Math.cos(radians) * r;
    }
    // Smooth the angle on the circle, rather than XYZ along a chord through the listener.
    for (const [param, values] of [[node.positionX, x], [node.positionZ, z]]) {
      const previous = scheduled.get(param);
      if (previous) {
        const index = Math.max(0, Math.min(previous.values.length - 1,
          (time - previous.start) / HORIZON * (previous.values.length - 1)));
        const lower = Math.floor(index), upper = Math.min(previous.values.length - 1, lower + 1);
        const held = previous.values[lower] + (previous.values[upper] - previous.values[lower]) * (index - lower);
        // Retire the consumed curve at the normal target time, including fresh/seek graphs.
        param.cancelScheduledValues(previous.start);
        param.setValueAtTime(held, time);
      } else {
        param.cancelAndHoldAtTime(time);
      }
      param.setValueCurveAtTime(values, time, HORIZON);
      scheduled.set(param, { values, start: time });
    }
  };
}
