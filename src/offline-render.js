import { getSpeakerLayout } from "./speaker-layout.js";
import { distanceRoomLevels } from "./spatial-parameters.js?v=20260927-06";

export function renderSpatialWav(buffer, directionCurve, distanceCurve, format = "quad", distanceBypassed = false) {
  if (format === "stereo") {
    return renderStereoSpatialWav(buffer, directionCurve, distanceCurve, distanceBypassed);
  }
  const layout = getSpeakerLayout(format);
  const sampleRate = buffer.sampleRate;
  const frameCount = buffer.length;
  const output = Array.from({ length: layout.length }, () => new Float32Array(frameCount));
  const left = buffer.getChannelData(0);
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
  const spread = buffer.numberOfChannels > 1 ? 45 : 0;
  const filters = [
    { value: 0 },
    { value: 0 }
  ];
  const reverb = Array.from({ length: layout.length }, () => ({
    a: new Float32Array(Math.floor(sampleRate * 0.043)),
    b: new Float32Array(Math.floor(sampleRate * 0.079)),
    ai: 0,
    bi: 0
  }));

  for (let i = 0; i < frameCount; i += 1) {
    const t = frameCount <= 1 ? 0 : i / (frameCount - 1);
    const direction = sampleDirection(directionCurve, t);
    const distance = distanceBypassed ? 0 : sampleDistance(distanceCurve, t);
    const mix = distanceRoomLevels(distance);
    const leftSample = distanceBypassed ? left[i] : shapeDistanceTone(left[i], distance, sampleRate, filters[0]);
    addPointSource(output, layout, reverb, leftSample, left[i], direction - spread, distance, mix, i);
    if (buffer.numberOfChannels > 1) {
      const rightSample = distanceBypassed ? right[i] : shapeDistanceTone(right[i], distance, sampleRate, filters[1]);
      addPointSource(output, layout, reverb, rightSample, right[i], direction + spread, distance, mix, i);
    }
  }

  return encodeWav(output, sampleRate, 0.98);
}

function renderStereoSpatialWav(buffer, directionCurve, distanceCurve, distanceBypassed) {
  if (buffer.numberOfChannels > 1) {
    return renderLinkedStereoWav(buffer, directionCurve, distanceCurve, distanceBypassed);
  }
  const sampleRate = buffer.sampleRate;
  const frameCount = buffer.length;
  const output = [new Float32Array(frameCount), new Float32Array(frameCount)];
  const left = buffer.getChannelData(0);
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
  const filters = [
    { value: 0 },
    { value: 0 }
  ];
  const reverb = [
    { a: new Float32Array(Math.floor(sampleRate * 0.037)), b: new Float32Array(Math.floor(sampleRate * 0.071)), ai: 0, bi: 0 },
    { a: new Float32Array(Math.floor(sampleRate * 0.041)), b: new Float32Array(Math.floor(sampleRate * 0.083)), ai: 0, bi: 0 }
  ];

  for (let i = 0; i < frameCount; i += 1) {
    const t = frameCount <= 1 ? 0 : i / (frameCount - 1);
    const direction = sampleDirection(directionCurve, t);
    const distance = distanceBypassed ? 0 : sampleDistance(distanceCurve, t);
    const mix = distanceRoomLevels(distance);
    const dry = buffer.numberOfChannels > 1 ? (left[i] + right[i]) * 0.5 : left[i];
    const shaped = distanceBypassed ? dry : shapeDistanceTone(dry, distance, sampleRate, filters[0]);
    const pan = Math.sin(direction * Math.PI / 180);
    const width = 1 - distance * 0.32;
    const direct = 1 - distance * 0.42;
    const leftGain = Math.cos((pan * width + 1) * Math.PI / 4) * direct;
    const rightGain = Math.sin((pan * width + 1) * Math.PI / 4) * direct;
    output[0][i] += shaped * leftGain * mix.dry;
    output[1][i] += shaped * rightGain * mix.dry;
    addStereoDiffuse(output, reverb, dry, mix.wet, i);
  }

  return encodeWav(output, sampleRate, 0.98);
}

// A 2-channel projection cannot distinguish front/back like HRTF. Keep source
// order and a minimum pan separation so its direct matrix never becomes singular.
function renderLinkedStereoWav(buffer, directionCurve, distanceCurve, bypassed) {
  const rate = buffer.sampleRate;
  const output = [new Float32Array(buffer.length), new Float32Array(buffer.length)];
  const inputs = [buffer.getChannelData(0), buffer.getChannelData(1)];
  const filters = [{ value: 0 }, { value: 0 }];
  const rooms = inputs.map(() => [
    { a: new Float32Array(Math.floor(rate * 0.037)), b: new Float32Array(Math.floor(rate * 0.071)), ai: 0, bi: 0 },
    { a: new Float32Array(Math.floor(rate * 0.041)), b: new Float32Array(Math.floor(rate * 0.083)), ai: 0, bi: 0 }
  ]);
  for (let i = 0; i < buffer.length; i += 1) {
    const t = buffer.length <= 1 ? 0 : i / (buffer.length - 1);
    const angle = sampleDirection(directionCurve, t) * Math.PI / 180;
    const distance = bypassed ? 0 : sampleDistance(distanceCurve, t);
    const mix = distanceRoomLevels(distance);
    const width = 1 - distance * 0.32;
    const halfSpan = Math.max(0.5, Math.abs(Math.cos(angle)) * Math.SQRT1_2 * width);
    const center = clamp(Math.sin(angle) * Math.SQRT1_2 * width, -1 + halfSpan, 1 - halfSpan);
    const direct = (1 - distance * 0.42) * mix.dry * 0.5;
    for (let source = 0; source < 2; source += 1) {
      const pan = clamp(center + (source === 0 ? -halfSpan : halfSpan), -1, 1);
      const dry = inputs[source][i];
      const shaped = bypassed ? dry : shapeDistanceTone(dry, distance, rate, filters[source]);
      output[0][i] += shaped * Math.cos((pan + 1) * Math.PI / 4) * direct;
      output[1][i] += shaped * Math.sin((pan + 1) * Math.PI / 4) * direct;
      addStereoDiffuse(output, rooms[source], dry * 0.5, mix.wet, i);
    }
  }
  return encodeWav(output, rate, 0.98);
}

function addStereoDiffuse(output, reverb, sample, wetMix, frame) {
  const roomInput = sample * 0.35;
  for (let channel = 0; channel < 2; channel += 1) {
    const tank = reverb[channel];
    const delayedA = tank.a[tank.ai];
    const delayedB = tank.b[tank.bi];
    output[channel][frame] += (delayedA * 0.5 + delayedB * 0.28) * wetMix;
    tank.a[tank.ai] = roomInput + delayedB * 0.34;
    tank.b[tank.bi] = (channel === 0 ? roomInput : -roomInput) - delayedA * 0.25;
    tank.ai = (tank.ai + 1) % tank.a.length;
    tank.bi = (tank.bi + 1) % tank.b.length;
  }
}

function addPointSource(output, layout, reverb, directSample, roomSample, direction, distance, mix, frame) {
  const directGain = 1 - distance * 0.48;
  const roomInput = roomSample * 0.3;
  const value = directSample * directGain * 0.85 * mix.dry;
  const weights = layout.map((angle) => {
    const diff = angularDistance(direction, angle.angle);
    return Math.max(0, Math.cos(diff * Math.PI / 180));
  });
  const normal = Math.sqrt(weights.reduce((sum, weight) => sum + weight * weight, 0)) || 1;
  for (let channel = 0; channel < output.length; channel += 1) {
    const tank = reverb[channel];
    const delayedA = tank.a[tank.ai];
    const delayedB = tank.b[tank.bi];
    const diffuse = (delayedA * 0.58 + delayedB * 0.32) * mix.wet;
    output[channel][frame] += value * (weights[channel] / normal) + diffuse;
    tank.a[tank.ai] = roomInput + delayedB * 0.36;
    tank.b[tank.bi] = roomInput - delayedA * 0.29;
    tank.ai = (tank.ai + 1) % tank.a.length;
    tank.bi = (tank.bi + 1) % tank.b.length;
  }
}

function shapeDistanceTone(sample, distance, sampleRate, state) {
  const cutoff = 19000 - distance * 9500;
  const rc = 1 / (Math.PI * 2 * cutoff);
  const dt = 1 / sampleRate;
  const alpha = dt / (rc + dt);
  state.value += alpha * (sample - state.value);
  return state.value;
}

function sampleDirection(points, t) {
  return sampleCurve(points, t) * 3600 - 1800;
}

function sampleDistance(points, t) {
  return clamp(sampleCurve(points, t), 0, 1);
}

function sampleCurve(points, t) {
  if (t <= points[0].x) return points[0].y;
  for (let i = 1; i < points.length; i += 1) {
    if (t <= points[i].x) {
      const a = points[i - 1];
      const b = points[i];
      const local = (t - a.x) / Math.max(0.0001, b.x - a.x);
      const eased = local * local * (3 - 2 * local);
      return a.y + (b.y - a.y) * eased;
    }
  }
  return points[points.length - 1].y;
}

function angularDistance(a, b) {
  let diff = ((a - b + 180) % 360) - 180;
  if (diff < -180) diff += 360;
  return Math.abs(diff);
}

function encodeWav(channels, sampleRate, ceiling = 1) {
  const channelCount = channels.length;
  const frameCount = channels[0].length;
  const bytesPerSample = 3;
  const blockAlign = channelCount * bytesPerSample;
  const dataSize = frameCount * blockAlign;
  const fadeFrames = Math.max(2, Math.min(frameCount, Math.floor(sampleRate * 0.008)));
  let peak = 0;
  for (let frame = 0; frame < frameCount; frame += 1) {
    const envelope = boundaryEnvelope(frame, frameCount, fadeFrames);
    for (let channel = 0; channel < channelCount; channel += 1) {
      peak = Math.max(peak, Math.abs(channels[channel][frame] * envelope));
    }
  }
  const safetyGain = peak > ceiling ? ceiling / peak : 1;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 24, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);
  let offset = 44;
  for (let frame = 0; frame < frameCount; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const envelope = boundaryEnvelope(frame, frameCount, fadeFrames);
      const sample = clamp(channels[channel][frame] * envelope * safetyGain, -1, 1);
      const encoded = Math.round(sample < 0 ? sample * 0x800000 : sample * 0x7fffff);
      view.setUint8(offset, encoded & 0xff);
      view.setUint8(offset + 1, (encoded >>> 8) & 0xff);
      view.setUint8(offset + 2, (encoded >>> 16) & 0xff);
      offset += bytesPerSample;
    }
  }
  return buffer;
}

function boundaryEnvelope(frame, frameCount, fadeFrames) {
  if (frameCount <= 1) return 0;
  const fadeIn = frame / Math.max(1, fadeFrames - 1);
  const fadeOut = (frameCount - 1 - frame) / Math.max(1, fadeFrames - 1);
  return clamp(Math.min(fadeIn, fadeOut), 0, 1);
}

function writeString(view, offset, value) {
  for (let i = 0; i < value.length; i += 1) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
