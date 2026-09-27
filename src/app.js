import { createDistanceProcessor, makeSmallRoomImpulse } from "./distance-engine.js?v=20260927-06";
import { renderSpatialWav } from "./offline-render.js?v=20260927-06";
import { getSpeakerLayout } from "./speaker-layout.js?v=20260926-03";

const fileInput = document.getElementById("fileInput");
const fileStatus = document.getElementById("fileStatus");
const timeStatus = document.getElementById("timeStatus");
const playButton = document.getElementById("playButton");
const stopButton = document.getElementById("stopButton");
const renderFormat = document.getElementById("renderFormat");
const downloadButton = document.getElementById("downloadButton");
const clearCurveButton = document.getElementById("clearCurveButton");
const resetButton = document.getElementById("resetButton");
const distanceBypass = document.getElementById("distanceBypass");
const directionMode = document.getElementById("directionMode");
const distanceMode = document.getElementById("distanceMode");
const penTool = document.getElementById("penTool");
const eraserTool = document.getElementById("eraserTool");
const waveCanvas = document.getElementById("waveCanvas");
const curveCanvas = document.getElementById("curveCanvas");
const spatialCanvas = document.getElementById("spatialCanvas");
const waveCtx = waveCanvas.getContext("2d");
const curveCtx = curveCanvas.getContext("2d");
const spatialCtx = spatialCanvas.getContext("2d");
const eraseModifier = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgentData?.platform || "")
  ? "metaKey"
  : "ctrlKey";

const inputReadout = document.getElementById("inputReadout");
const modeReadout = document.getElementById("modeReadout");
const pointsReadout = document.getElementById("pointsReadout");
const directionReadout = document.getElementById("directionReadout");
const distanceReadout = document.getElementById("distanceReadout");
const motionReadout = document.getElementById("motionReadout");
const spatialModeLabel = document.getElementById("spatialModeLabel");
const downloadReadout = document.getElementById("downloadReadout");
const engineReadout = document.getElementById("engineReadout");

const colors = {
  direction: "#66d2ff",
  distance: "#ff4b3e",
  bg: "#101519",
  paper: "#bdc8aa",
  grid: "rgba(55, 65, 55, 0.36)",
  text: "#edf3f2",
  ink: "#172026",
  muted: "#52625d",
  listener: "#edf3f2"
};

const axisWidth = 104;
const plotPaddingTop = 18;
const plotPaddingBottom = 24;
const activeRadius = 10;
const channelSpreadDegrees = 45;
const defaultSampleSettings = {
  duration: 45,
  burst: 0.045833,
  gap: 0.020833,
  attack: 0.003,
  decay: 0.014,
  sustain: 0.22,
  release: 0.018,
  gain: 0.32
};
const curves = {
  direction: [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }],
  distance: [{ x: 0, y: 0 }, { x: 1, y: 0 }]
};
const defaults = {
  direction: () => [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }],
  distance: () => [{ x: 0, y: 0 }, { x: 1, y: 0 }]
};

let activeCurve = "direction";
let audioContext;
let buffer = null;
let waveform = [];
let source = null;
let previewMaster = null;
let panners = [];
let distanceProcessors = [];
let roomImpulse = null;
let playStartedAt = 0;
let pauseAt = 0;
let rafId = null;
let isPlaying = false;
let selectedTool = "pen";
let eraseModifierActive = false;
let selectedPoint = null;
let hoveredPoint = null;

setupCanvasSizing();
loadDefaultSample();
drawAll();

window.addEventListener("resize", () => {
  setupCanvasSizing();
  drawAll();
});

fileInput.addEventListener("change", handleFile);
playButton.addEventListener("click", () => {
  if (isPlaying) stop(false);
  else play();
});
stopButton.addEventListener("click", stop);
downloadButton.addEventListener("click", downloadRenderedWav);
renderFormat.addEventListener("change", () => {
  updateReadouts(currentTimeNorm());
  downloadReadout.textContent = buffer ? "ready" : "not ready";
  drawAll();
});

window.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
  if (event.code !== "Space" || isTyping || event.repeat || !buffer) return;
  event.preventDefault();
  event.stopPropagation();
  if (document.activeElement instanceof HTMLButtonElement) {
    document.activeElement.blur();
  }
  if (isPlaying) stop(false);
  else play();
});

window.addEventListener("keyup", (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
  if (event.code !== "Space" || isTyping) return;
  event.preventDefault();
  event.stopPropagation();
});
clearCurveButton.addEventListener("click", clearCurrentCurve);
resetButton.addEventListener("click", resetAll);
distanceBypass.addEventListener("change", updateDistanceControls);
directionMode.addEventListener("click", () => setActiveCurve("direction"));
distanceMode.addEventListener("click", () => setActiveCurve("distance"));
penTool.addEventListener("click", () => setTool("pen"));
eraserTool.addEventListener("click", () => setTool("eraser"));

curveCanvas.addEventListener("pointerdown", onPointerDown);
curveCanvas.addEventListener("pointermove", onPointerMove);
curveCanvas.addEventListener("pointerup", onPointerUp);
curveCanvas.addEventListener("pointerleave", () => {
  hoveredPoint = null;
  drawAll();
});
curveCanvas.addEventListener("pointerenter", updateEraseCursor);
window.addEventListener("keydown", (event) => {
  if (event[eraseModifier]) eraseModifierActive = true;
  updateEraseCursor(event);
});
window.addEventListener("keyup", (event) => {
  const modifierKey = eraseModifier === "metaKey" ? "Meta" : "Control";
  eraseModifierActive = event.key === modifierKey ? false : Boolean(event[eraseModifier]);
  updateEraseCursor();
});
window.addEventListener("blur", () => {
  eraseModifierActive = false;
  updateEraseCursor();
});

async function handleFile(event) {
  const [file] = event.target.files;
  if (!file) return;
  stop();
  fileStatus.textContent = "Loading audio";
  playButton.disabled = true;
  stopButton.disabled = true;
  downloadButton.disabled = true;
  try {
    const arrayBuffer = await file.arrayBuffer();
    const context = getAudioContext();
    const decodedBuffer = await decodeAudioBuffer(context, arrayBuffer);
    installAudioBuffer(decodedBuffer, `${file.name} / ${formatDuration(decodedBuffer.duration)} / ${decodedBuffer.numberOfChannels}ch`);
  } catch (error) {
    buffer = null;
    waveform = [];
    inputReadout.textContent = "mono/stereo";
    fileStatus.textContent = "Cannot decode audio file";
    downloadReadout.textContent = "not ready";
    updateTime(0);
    console.error(error);
  }
  drawAll();
}

function loadDefaultSample() {
  const context = getAudioContext();
  const sampleBuffer = createDefaultNoiseIntervalSample(context);
  installAudioBuffer(sampleBuffer, `Default noise interval / ${formatDuration(sampleBuffer.duration)} / mono`);
}

function installAudioBuffer(audioBuffer, label) {
  buffer = audioBuffer;
  waveform = buildWaveform(buffer, 1800);
  inputReadout.textContent = buffer.numberOfChannels === 1 ? "mono" : "stereo";
  fileStatus.textContent = label;
  playButton.disabled = false;
  stopButton.disabled = false;
  downloadButton.disabled = false;
  pauseAt = 0;
  downloadReadout.textContent = "ready";
  updateTime(0);
}

function createDefaultNoiseIntervalSample(context) {
  const settings = defaultSampleSettings;
  const sampleRate = context.sampleRate;
  const frameCount = Math.floor(settings.duration * sampleRate);
  const audioBuffer = context.createBuffer(1, frameCount, sampleRate);
  const data = audioBuffer.getChannelData(0);
  const burstFrames = Math.max(1, Math.floor(settings.burst * sampleRate));
  const cycleFrames = Math.max(burstFrames + 1, Math.floor((settings.burst + settings.gap) * sampleRate));
  const attackFrames = Math.max(1, Math.floor(settings.attack * sampleRate));
  const decayFrames = Math.max(1, Math.floor(settings.decay * sampleRate));
  const releaseFrames = Math.max(1, Math.floor(settings.release * sampleRate));
  const releaseStart = Math.max(attackFrames + decayFrames, burstFrames - releaseFrames);
  const random = seededRandom(45066);

  for (let start = 0; start < frameCount; start += cycleFrames) {
    const end = Math.min(frameCount, start + burstFrames);
    for (let frame = start; frame < end; frame += 1) {
      const localFrame = frame - start;
      const envelope = noiseEnvelope(localFrame, attackFrames, decayFrames, releaseStart, burstFrames, settings.sustain);
      data[frame] = (random() * 2 - 1) * envelope * settings.gain;
    }
  }

  return audioBuffer;
}

function noiseEnvelope(frame, attackFrames, decayFrames, releaseStart, burstFrames, sustain) {
  if (frame < attackFrames) return frame / attackFrames;
  if (frame < attackFrames + decayFrames) {
    const t = (frame - attackFrames) / decayFrames;
    return 1 + (sustain - 1) * t;
  }
  if (frame >= releaseStart) {
    const t = (frame - releaseStart) / Math.max(1, burstFrames - releaseStart);
    return sustain * (1 - clamp(t, 0, 1));
  }
  return sustain;
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function getAudioContext() {
  if (!audioContext) audioContext = new AudioContext();
  return audioContext;
}

function decodeAudioBuffer(context, arrayBuffer) {
  const data = arrayBuffer.slice(0);
  return new Promise((resolve, reject) => {
    const promise = context.decodeAudioData(data, resolve, reject);
    if (promise?.then) promise.then(resolve).catch(reject);
  });
}

async function play() {
  if (!buffer) return;
  if (pauseAt >= buffer.duration - 0.02) pauseAt = 0;
  const context = getAudioContext();
  await context.resume();
  stopPlaybackNodes();

  source = context.createBufferSource();
  source.buffer = buffer;
  previewMaster = context.createGain();
  previewMaster.connect(context.destination);

  const inputCount = Math.min(buffer.numberOfChannels, 2);
  if (!roomImpulse) roomImpulse = makeSmallRoomImpulse(context);
  panners = [];
  distanceProcessors = [];

  for (let channel = 0; channel < inputCount; channel += 1) {
    const splitter = context.createChannelSplitter(buffer.numberOfChannels);
    const channelGain = context.createGain();
    const panner = context.createPanner();
    const distanceInput = context.createGain();
    const spread = inputCount === 2 ? (channel === 0 ? -channelSpreadDegrees : channelSpreadDegrees) : 0;
    splitter.connect(channelGain, channel);
    channelGain.connect(distanceInput);
    panner.panningModel = "HRTF";
    panner.distanceModel = "linear";
    panner.refDistance = 1;
    panner.maxDistance = 6;
    panner.rolloffFactor = 0;
    const processor = createDistanceProcessor(context, distanceInput, panner, roomImpulse);
    panner.connect(previewMaster);
    source.connect(splitter);
    panners.push({ node: panner, spread });
    distanceProcessors.push(processor);
  }

  const previewStartTime = context.currentTime;
  const remainingDuration = Math.max(0, buffer.duration - pauseAt);
  schedulePreviewEnvelope(previewMaster.gain, previewStartTime, remainingDuration);
  updatePreview(pauseAt / buffer.duration, true);
  source.onended = () => {
    if (isPlaying) stop(true);
  };
  playStartedAt = context.currentTime - pauseAt;
  source.start(0, pauseAt);
  isPlaying = true;
  playButton.textContent = "Pause";
  tick();
}

function stop(resetPosition = true) {
  if (isPlaying && audioContext) {
    pauseAt = Math.min(buffer?.duration || 0, audioContext.currentTime - playStartedAt);
  }
  isPlaying = false;
  stopPlaybackNodes(true);
  playButton.textContent = "Play";
  if (resetPosition) pauseAt = 0;
  updateTime(pauseAt);
  updateReadouts(currentTimeNorm());
  drawAll();
}

function stopPlaybackNodes(fadeOut = false) {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  const stoppedSource = source;
  const stoppedPanners = panners;
  const stoppedProcessors = distanceProcessors;
  const stoppedMaster = previewMaster;
  source = null;
  previewMaster = null;
  panners = [];
  distanceProcessors = [];

  const disconnectGraph = () => {
    if (stoppedSource) stoppedSource.disconnect();
    stoppedPanners.forEach(({ node }) => node.disconnect());
    stoppedProcessors.forEach((processor) => processor.disconnect());
    if (stoppedMaster) stoppedMaster.disconnect();
  };

  if (stoppedSource) {
    try {
      if (fadeOut && audioContext && stoppedMaster) {
        const now = audioContext.currentTime;
        stoppedMaster.gain.cancelScheduledValues(now);
        stoppedMaster.gain.setValueAtTime(stoppedMaster.gain.value, now);
        stoppedMaster.gain.linearRampToValueAtTime(0, now + 0.008);
        stoppedSource.onended = null;
        stoppedSource.stop(now + 0.009);
        setTimeout(disconnectGraph, 30);
        return;
      }
      stoppedSource.stop();
    } catch {
      /* already stopped */
    }
  }
  disconnectGraph();
}

function schedulePreviewEnvelope(gainParam, startTime, duration) {
  const fade = Math.min(0.008, duration * 0.25);
  gainParam.cancelScheduledValues(startTime);
  gainParam.setValueAtTime(0, startTime);
  gainParam.linearRampToValueAtTime(0.9, startTime + fade);
  if (duration > fade * 2) gainParam.setValueAtTime(0.9, startTime + duration - fade);
  gainParam.linearRampToValueAtTime(0, startTime + duration);
}

function tick() {
  if (!isPlaying || !buffer || !audioContext) return;
  const seconds = Math.min(buffer.duration, audioContext.currentTime - playStartedAt);
  const t = seconds / buffer.duration;
  updatePreview(t);
  updateTime(seconds);
  updateReadouts(t);
  drawAll(t);
  if (seconds >= buffer.duration) {
    stop();
    return;
  }
  rafId = requestAnimationFrame(tick);
}

function updatePreview(t, immediate = false) {
  const angle = directionAt(t);
  const distance = distanceAt(t);
  panners.forEach(({ node, spread }) => {
    const radians = ((angle + spread) % 360) * Math.PI / 180;
    const radius = 1 + distance * 3.5;
    setPannerPosition(node, Math.sin(radians) * radius, 0, -Math.cos(radians) * radius, immediate);
  });
  distanceProcessors.forEach((processor) => processor.update(
    distance,
    distanceBypass.checked,
    audioContext.currentTime,
    immediate
  ));
}

function setPannerPosition(node, x, y, z, immediate = false) {
  if (node.positionX && node.positionY && node.positionZ) {
    const method = immediate ? "setValueAtTime" : "setTargetAtTime";
    const args = immediate ? [audioContext.currentTime] : [audioContext.currentTime, 0.025];
    node.positionX[method](x, ...args);
    node.positionY[method](y, ...args);
    node.positionZ[method](z, ...args);
    return;
  }
  if (typeof node.setPosition === "function") {
    node.setPosition(x, y, z);
  }
}

async function downloadRenderedWav() {
  if (!buffer) return;
  downloadButton.disabled = true;
  downloadButton.textContent = "Rendering";
  downloadReadout.textContent = "rendering";
  try {
    const wav = renderSpatialWav(
      buffer,
      curves.direction,
      curves.distance,
      renderFormat.value,
      distanceBypass.checked
    );
    const blob = new Blob([wav], { type: "audio/wav" });
    const downloadUrl = URL.createObjectURL(blob);
    const channels = channelCountForFormat(renderFormat.value);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `space-curve-lab-${channels}ch.wav`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 500);
    downloadReadout.textContent = `${channels}ch downloaded`;
  } catch (error) {
    downloadReadout.textContent = "render failed";
    console.error(error);
  } finally {
    downloadButton.disabled = false;
    downloadButton.textContent = "Download WAV";
  }
}

function setActiveCurve(name) {
  activeCurve = name;
  directionMode.classList.toggle("active", name === "direction");
  distanceMode.classList.toggle("active", name === "distance");
  modeReadout.textContent = name === "direction" ? "Direction" : "Distance";
  updateReadouts(currentTimeNorm());
  drawAll();
}

function clearCurrentCurve() {
  curves[activeCurve] = defaults[activeCurve]();
  updateReadouts(currentTimeNorm());
  drawAll();
}

function resetAll() {
  curves.direction = defaults.direction();
  curves.distance = defaults.distance();
  pauseAt = 0;
  downloadReadout.textContent = buffer ? "ready" : "not ready";
  updateReadouts(0);
  drawAll();
}

function isErasing(event) {
  return selectedTool === "eraser" || eraseModifierActive || Boolean(event?.[eraseModifier]);
}

function updateEraseCursor(event) {
  curveCanvas.classList.toggle("eraseMode", isErasing(event));
}

function setTool(tool) {
  selectedTool = tool;
  penTool.classList.toggle("active", tool === "pen");
  eraserTool.classList.toggle("active", tool === "eraser");
  penTool.setAttribute("aria-pressed", String(tool === "pen"));
  eraserTool.setAttribute("aria-pressed", String(tool === "eraser"));
  selectedPoint = null;
  updateEraseCursor();
  drawAll();
}

function onPointerDown(event) {
  if (event.button !== 0) return;
  const point = pointerToPoint(event);
  const foundPoint = findPoint(point.x, point.y);
  if (isErasing(event)) {
    event.preventDefault();
    if (foundPoint) {
      const points = curves[foundPoint.curve];
      if (foundPoint.index > 0 && foundPoint.index < points.length - 1) {
        points.splice(foundPoint.index, 1);
        selectedPoint = null;
        hoveredPoint = null;
        downloadReadout.textContent = buffer ? "ready" : "not ready";
        updateReadouts(currentTimeNorm());
        drawAll();
      }
    }
    return;
  }
  curveCanvas.setPointerCapture(event.pointerId);
  selectedPoint = foundPoint;
  if (!selectedPoint) {
    const next = canvasToCurve(point.x, point.y);
    curves[activeCurve].push(next);
    sortCurve(activeCurve);
    selectedPoint = { curve: activeCurve, index: curves[activeCurve].indexOf(next) };
  }
  moveSelected(event);
}

function onPointerMove(event) {
  updateEraseCursor(event);
  if (selectedPoint) {
    moveSelected(event);
    return;
  }
  const point = pointerToPoint(event);
  hoveredPoint = findPoint(point.x, point.y);
  drawAll();
}

function onPointerUp(event) {
  if (curveCanvas.hasPointerCapture(event.pointerId)) curveCanvas.releasePointerCapture(event.pointerId);
  selectedPoint = null;
  downloadReadout.textContent = buffer ? "ready" : "not ready";
}

function moveSelected(event) {
  const point = pointerToPoint(event);
  const curvePoint = canvasToCurve(point.x, point.y);
  const points = curves[selectedPoint.curve];
  const index = selectedPoint.index;
  const movedPoint = {
    x: index === 0 ? 0 : index === points.length - 1 ? 1 : curvePoint.x,
    y: curvePoint.y
  };
  points[index] = movedPoint;
  sortCurve(selectedPoint.curve);
  selectedPoint.index = points.indexOf(movedPoint);
  updateReadouts(currentTimeNorm());
  drawAll();
}

function findPoint(x, y) {
  for (const name of ["direction", "distance"]) {
    if (name !== activeCurve) continue;
    for (let i = 0; i < curves[name].length; i += 1) {
      const screen = curveToCanvas(curves[name][i]);
      if (Math.hypot(screen.x - x, screen.y - y) <= activeRadius) return { curve: name, index: i };
    }
  }
  return null;
}

function sortCurve(name) {
  curves[name].sort((a, b) => a.x - b.x);
}

function drawAll(playheadNorm = currentTimeNorm()) {
  drawWave(playheadNorm);
  drawCurves(playheadNorm);
  drawSpatial(playheadNorm);
}

function drawWave(playheadNorm) {
  const w = waveCanvas.width;
  const h = waveCanvas.height;
  waveCtx.clearRect(0, 0, w, h);
  waveCtx.fillStyle = colors.paper;
  waveCtx.fillRect(0, 0, w, h);
  waveCtx.strokeStyle = "rgba(55, 65, 55, 0.28)";
  waveCtx.lineWidth = 1;
  for (let i = 0; i <= 10; i += 1) {
    const x = axisWidth + (w - axisWidth - 18) * (i / 10);
    waveCtx.beginPath();
    waveCtx.moveTo(x, 0);
    waveCtx.lineTo(x, h);
    waveCtx.stroke();
  }
  const mid = h * 0.5;
  const amp = h * 0.36;
  if (waveform.length) {
    waveCtx.fillStyle = "rgba(108, 101, 72, 0.34)";
    waveCtx.beginPath();
    waveform.forEach((value, i) => {
      const x = axisWidth + (w - axisWidth - 18) * (i / Math.max(1, waveform.length - 1));
      const y = mid - value * amp;
      if (i === 0) waveCtx.moveTo(x, y);
      else waveCtx.lineTo(x, y);
    });
    for (let i = waveform.length - 1; i >= 0; i -= 1) {
      const value = waveform[i];
      const x = axisWidth + (w - axisWidth - 18) * (i / Math.max(1, waveform.length - 1));
      const y = mid + value * amp;
      waveCtx.lineTo(x, y);
    }
    waveCtx.closePath();
    waveCtx.fill();
    waveCtx.strokeStyle = "rgba(23, 32, 38, 0.34)";
    waveCtx.lineWidth = 1;
    waveCtx.stroke();
  } else {
    waveCtx.strokeStyle = "rgba(23, 32, 38, 0.34)";
    waveCtx.lineWidth = 1.2;
    waveCtx.beginPath();
    waveCtx.moveTo(axisWidth, mid);
    waveCtx.lineTo(w - 18, mid);
    waveCtx.stroke();
  }
  waveCtx.fillStyle = "rgba(23, 32, 38, 0.62)";
  waveCtx.font = "700 12px Inter, sans-serif";
  waveCtx.textAlign = "center";
  waveCtx.textBaseline = "middle";
  waveCtx.fillText("Waveform", axisWidth + ((w - axisWidth - 18) / 2), h / 2);
  waveCtx.textAlign = "left";
  waveCtx.textBaseline = "alphabetic";
  drawPlayhead(waveCtx, waveCanvas, playheadNorm);
}

function drawCurves(playheadNorm) {
  const w = curveCanvas.width;
  const h = curveCanvas.height;
  curveCtx.clearRect(0, 0, w, h);
  curveCtx.fillStyle = colors.paper;
  curveCtx.fillRect(0, 0, w, h);
  drawCurveGrid();
  drawCurveLine("direction", colors.direction);
  drawCurveLine("distance", colors.distance);
  drawPlayhead(curveCtx, curveCanvas, playheadNorm);
  drawHoverLabel();
}

function drawCurveGrid() {
  const w = curveCanvas.width;
  const h = curveCanvas.height;
  const plotBottom = h - plotPaddingBottom;
  curveCtx.strokeStyle = colors.grid;
  curveCtx.fillStyle = colors.ink;
  curveCtx.font = "650 12px Inter, sans-serif";
  curveCtx.textBaseline = "middle";
  curveCtx.fillStyle = "rgba(23, 32, 38, 0.07)";
  curveCtx.fillRect(0, 0, axisWidth, h);
  curveCtx.strokeStyle = "rgba(23, 32, 38, 0.24)";
  curveCtx.beginPath();
  curveCtx.moveTo(axisWidth, plotPaddingTop);
  curveCtx.lineTo(axisWidth, plotBottom);
  curveCtx.stroke();

  for (let i = 0; i <= 10; i += 1) {
    const x = axisWidth + (w - axisWidth - 18) * (i / 10);
    curveCtx.strokeStyle = colors.grid;
    curveCtx.beginPath();
    curveCtx.moveTo(x, plotPaddingTop);
    curveCtx.lineTo(x, plotBottom);
    curveCtx.stroke();
  }

  if (activeCurve === "distance") {
    drawDistanceAxis(w);
  } else {
    drawDirectionAxis(w);
  }

  curveCtx.textAlign = "left";
  curveCtx.textBaseline = "alphabetic";
}

function drawDirectionAxis(width) {
  for (let rotation = -5; rotation <= 5; rotation += 1) {
    const value = rotation * 360;
    const y = valueToY(value);
    const label = formatRotationAxisLabel(rotation);
    curveCtx.strokeStyle = rotation === 0 ? "rgba(23, 32, 38, 0.54)" : "rgba(23, 32, 38, 0.18)";
    curveCtx.beginPath();
    curveCtx.moveTo(axisWidth, y);
    curveCtx.lineTo(width - 18, y);
    curveCtx.stroke();
    curveCtx.fillStyle = rotation === 0 ? "rgba(23, 32, 38, 0.92)" : "rgba(23, 32, 38, 0.68)";
    curveCtx.font = "650 12px Inter, sans-serif";
    curveCtx.textAlign = "right";
    curveCtx.fillText(label, axisWidth - 12, y);
  }
}

function formatRotationAxisLabel(rotation) {
  if (rotation > 0) return `+${rotation} CW`;
  if (rotation < 0) return `${rotation} CCW`;
  return "0";
}

function drawDistanceAxis(width) {
  const marks = [
    { value: 1, label: "1 Far", strong: true },
    { value: 0.5, label: "0.5", strong: false },
    { value: 0, label: "0 Near", strong: true }
  ];
  for (const mark of marks) {
    const y = valueToY(mark.value, "distance");
    curveCtx.strokeStyle = mark.value === 0.5 ? "rgba(23, 32, 38, 0.32)" : "rgba(23, 32, 38, 0.18)";
    curveCtx.beginPath();
    curveCtx.moveTo(axisWidth, y);
    curveCtx.lineTo(width - 18, y);
    curveCtx.stroke();
    curveCtx.fillStyle = mark.strong ? "rgba(23, 32, 38, 0.86)" : "rgba(23, 32, 38, 0.58)";
    curveCtx.font = mark.strong ? "700 12px Inter, sans-serif" : "650 12px Inter, sans-serif";
    curveCtx.textAlign = "right";
    curveCtx.fillText(mark.label, axisWidth - 12, y);
  }
}

function drawCurveLine(name, color) {
  const points = curves[name];
  curveCtx.strokeStyle = color;
  curveCtx.globalAlpha = 1;
  curveCtx.lineWidth = name === activeCurve ? 4.8 : 2.1;
  curveCtx.lineCap = "round";
  curveCtx.lineJoin = "round";
  curveCtx.beginPath();
  const left = axisWidth;
  const right = curveCanvas.width - 18;
  for (let x = left; x <= right; x += 3) {
    const t = (x - left) / Math.max(1, right - left);
    const yValue = sampleCurve(name, t);
    const screen = curveToCanvas({ x: t, y: yValue }, name);
    if (x === left) curveCtx.moveTo(screen.x, screen.y);
    else curveCtx.lineTo(screen.x, screen.y);
  }
  curveCtx.stroke();
  if (name !== activeCurve) return;
  points.forEach((point, index) => {
    const screen = curveToCanvas(point, name);
    curveCtx.fillStyle = color;
    curveCtx.beginPath();
    curveCtx.arc(screen.x, screen.y, 6, 0, Math.PI * 2);
    curveCtx.fill();
    if (index !== 0 && index !== points.length - 1) {
      curveCtx.strokeStyle = "rgba(16, 21, 25, 0.8)";
      curveCtx.lineWidth = 2;
      curveCtx.stroke();
    }
  });
}

function drawPlayhead(context, canvas, playheadNorm) {
  const x = axisWidth + (canvas.width - axisWidth - 18) * clamp(playheadNorm, 0, 1);
  context.strokeStyle = "#101519";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x, 0);
  context.lineTo(x, canvas.height);
  context.stroke();
}

function drawHoverLabel() {
  if (!hoveredPoint) return;
  const point = curves[hoveredPoint.curve][hoveredPoint.index];
  const screen = curveToCanvas(point, hoveredPoint.curve);
  const label = hoveredPoint.curve === "direction"
    ? `${directionValue(point.y).toFixed(0)} deg`
    : `${distanceValue(point.y).toFixed(2)}`;
  curveCtx.fillStyle = "rgba(16, 21, 25, 0.9)";
  curveCtx.fillRect(screen.x + 12, screen.y - 30, 92, 24);
  curveCtx.fillStyle = colors.text;
  curveCtx.font = "650 12px Inter, sans-serif";
  curveCtx.fillText(label, screen.x + 20, screen.y - 14);
}

function drawSpatial(playheadNorm) {
  const w = spatialCanvas.width;
  const h = spatialCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const angle = directionAt(playheadNorm);
  const distance = distanceAt(playheadNorm);
  const radius = 42 + distance * 170;
  spatialCtx.clearRect(0, 0, w, h);
  spatialCtx.fillStyle = "#151d22";
  spatialCtx.fillRect(0, 0, w, h);
  spatialCtx.strokeStyle = "#324047";
  spatialCtx.lineWidth = 2;
  spatialCtx.strokeRect(28, 28, w - 56, h - 56);
  for (let r = 70; r <= 210; r += 70) {
    spatialCtx.strokeStyle = "rgba(237, 243, 242, 0.08)";
    spatialCtx.beginPath();
    spatialCtx.arc(cx, cy, r, 0, Math.PI * 2);
    spatialCtx.stroke();
  }
  drawSpeakerRing(cx, cy);
  drawMotionTrail(cx, cy, playheadNorm);
  spatialCtx.fillStyle = colors.listener;
  spatialCtx.beginPath();
  spatialCtx.arc(cx, cy, 13, 0, Math.PI * 2);
  spatialCtx.fill();
  spatialCtx.fillStyle = "#9fb0b2";
  spatialCtx.font = "700 12px Inter, sans-serif";
  spatialCtx.fillText("Listener", cx - 24, cy + 34);
  const radians = (angle % 360) * Math.PI / 180;
  const x = cx + Math.sin(radians) * radius;
  const y = cy - Math.cos(radians) * radius;
  spatialCtx.strokeStyle = "rgba(255, 75, 62, 0.32)";
  spatialCtx.lineWidth = 2;
  spatialCtx.beginPath();
  spatialCtx.moveTo(cx, cy);
  spatialCtx.lineTo(x, y);
  spatialCtx.stroke();
  spatialCtx.fillStyle = colors.distance;
  spatialCtx.beginPath();
  spatialCtx.arc(x, y, 18, 0, Math.PI * 2);
  spatialCtx.fill();
}

function drawMotionTrail(cx, cy, playheadNorm) {
  const steps = 34;
  const start = Math.max(0, playheadNorm - 0.16);
  for (let i = 0; i <= steps; i += 1) {
    const t = start + (playheadNorm - start) * (i / steps);
    const angle = directionAt(t);
    const distance = distanceAt(t);
    const radius = 42 + distance * 170;
    const radians = (angle % 360) * Math.PI / 180;
    const x = cx + Math.sin(radians) * radius;
    const y = cy - Math.cos(radians) * radius;
    const alpha = 0.025 + 0.15 * (i / steps);
    spatialCtx.fillStyle = `rgba(255, 75, 62, ${alpha})`;
    spatialCtx.beginPath();
    spatialCtx.arc(x, y, 2 + 2.8 * (i / steps), 0, Math.PI * 2);
    spatialCtx.fill();
  }
}

function drawSpeakerRing(cx, cy) {
  if (renderFormat.value === "stereo") {
    drawStereoMarkers(cx, cy);
    return;
  }
  const layout = getSpeakerLayout(renderFormat.value);
  const radius = 216;
  spatialCtx.fillStyle = "#66d2ff";
  spatialCtx.font = "700 11px Inter, sans-serif";
  for (const speaker of layout) {
    const radians = speaker.angle * Math.PI / 180;
    const x = cx + Math.sin(radians) * radius;
    const y = cy - Math.cos(radians) * radius;
    spatialCtx.beginPath();
    spatialCtx.arc(x, y, 5, 0, Math.PI * 2);
    spatialCtx.fill();
    spatialCtx.fillText(String(speaker.channel), x + 8, y + 4);
  }
}

function drawStereoMarkers(cx, cy) {
  const radius = 190;
  const markers = [
    { label: "L", angle: 315 },
    { label: "R", angle: 45 }
  ];
  spatialCtx.fillStyle = "#66d2ff";
  spatialCtx.font = "700 12px Inter, sans-serif";
  for (const marker of markers) {
    const radians = marker.angle * Math.PI / 180;
    const x = cx + Math.sin(radians) * radius;
    const y = cy - Math.cos(radians) * radius;
    spatialCtx.beginPath();
    spatialCtx.arc(x, y, 5, 0, Math.PI * 2);
    spatialCtx.fill();
    spatialCtx.fillText(marker.label, x + 8, y + 4);
  }
}

function pointerToPoint(event) {
  const rect = curveCanvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (curveCanvas.width / rect.width),
    y: (event.clientY - rect.top) * (curveCanvas.height / rect.height)
  };
}

function canvasToCurve(x, y) {
  const w = curveCanvas.width;
  const plotTop = plotPaddingTop;
  const plotBottom = curveCanvas.height - plotPaddingBottom;
  const distanceY = clamp((plotBottom - y) / Math.max(1, plotBottom - plotTop), 0, 1);
  return {
    x: clamp((x - axisWidth) / (w - axisWidth - 18), 0, 1),
    y: activeCurve === "direction"
      ? directionYFromValue(directionValueFromCanvas(y))
      : distanceY
  };
}

function curveToCanvas(point, name = activeCurve) {
  const x = axisWidth + (curveCanvas.width - axisWidth - 18) * point.x;
  const y = name === "direction"
    ? valueToY(directionValue(point.y))
    : valueToY(point.y, "distance");
  return { x, y };
}

function valueToY(value, scale = "direction") {
  const plotTop = plotPaddingTop;
  const plotBottom = curveCanvas.height - plotPaddingBottom;
  const plotHeight = Math.max(1, plotBottom - plotTop);
  const normalized = scale === "distance"
    ? clamp(value, 0, 1)
    : clamp((value + 1800) / 3600, 0, 1);
  return plotBottom - normalized * plotHeight;
}

function directionValueFromCanvas(y) {
  const plotTop = plotPaddingTop;
  const plotBottom = curveCanvas.height - plotPaddingBottom;
  const normalized = clamp((plotBottom - y) / Math.max(1, plotBottom - plotTop), 0, 1);
  return normalized * 3600 - 1800;
}

function directionYFromValue(value) {
  return (clamp(value, -1800, 1800) + 1800) / 3600;
}

function directionValue(y) {
  return y * 3600 - 1800;
}

function distanceValue(y) {
  return clamp(y, 0, 1);
}

function updateDistanceControls() {
  downloadReadout.textContent = buffer ? "ready" : "not ready";
  updateReadouts(currentTimeNorm());
  if (isPlaying) updatePreview(currentTimeNorm());
}

function directionAt(t) {
  return directionValue(sampleCurve("direction", t));
}

function distanceAt(t) {
  return distanceBypass.checked ? 0 : distanceValue(sampleCurve("distance", t));
}

function sampleCurve(name, t) {
  const points = curves[name];
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

function updateReadouts(t) {
  const angle = directionAt(t);
  const distance = distanceAt(t);
  const rotations = angle / 360;
  pointsReadout.textContent = String(curves[activeCurve].length);
  directionReadout.textContent = `${angle.toFixed(0)} deg`;
  distanceReadout.textContent = distanceBypass.checked ? "Bypassed" : `${distance < 0.5 ? "Near" : "Far"} ${distance.toFixed(2)}`;
  motionReadout.textContent = `${rotations.toFixed(2)} rotations`;
  engineReadout.textContent = renderFormat.value === "stereo" ? "headphone 2ch" : "speaker map";
  spatialModeLabel.textContent = spatialLabelForFormat(renderFormat.value);
}

function channelCountForFormat(format) {
  if (format === "stereo") return 2;
  if (format === "quad") return 4;
  return 8;
}

function spatialLabelForFormat(format) {
  if (format === "stereo") return "Stereo 2ch";
  if (format === "quad") return "Quad 4ch";
  return "Octo 8ch";
}

function updateTime(seconds) {
  timeStatus.textContent = `${formatDuration(seconds)} / ${formatDuration(buffer?.duration || 0)}`;
}

function currentTimeNorm() {
  if (!buffer) return 0;
  if (isPlaying && audioContext) return clamp((audioContext.currentTime - playStartedAt) / buffer.duration, 0, 1);
  return clamp(pauseAt / buffer.duration, 0, 1);
}

function buildWaveform(audioBuffer, buckets) {
  const channelCount = Math.min(audioBuffer.numberOfChannels, 2);
  const length = audioBuffer.length;
  const values = [];
  let maxValue = 0;
  for (let i = 0; i < buckets; i += 1) {
    const start = Math.floor((i / buckets) * length);
    const end = Math.floor(((i + 1) / buckets) * length);
    let sum = 0;
    let count = 0;
    for (let channel = 0; channel < channelCount; channel += 1) {
      const data = audioBuffer.getChannelData(channel);
      for (let j = start; j < end; j += 1) {
        const sample = data[j] || 0;
        sum += sample * sample;
        count += 1;
      }
    }
    const rms = count ? Math.sqrt(sum / count) : 0;
    maxValue = Math.max(maxValue, rms);
    values.push(rms);
  }
  if (maxValue <= 0) return values;
  return values.map((value) => value / maxValue);
}

function formatDuration(seconds) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe - minutes * 60;
  return `${String(minutes).padStart(2, "0")}:${rest.toFixed(2).padStart(5, "0")}`;
}

function setupCanvasSizing() {
  for (const canvas of [waveCanvas, curveCanvas]) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(900, Math.floor(rect.width || 1200));
    const height = canvas === waveCanvas ? 150 : 560;
    canvas.width = width;
    canvas.height = height;
  }
  const spatialRect = spatialCanvas.getBoundingClientRect();
  const side = Math.max(360, Math.floor(spatialRect.width || 520));
  spatialCanvas.width = side;
  spatialCanvas.height = side;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
