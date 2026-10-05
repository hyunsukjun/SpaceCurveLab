import { prepareWavChannels } from "./render-resampling.js?v=20261006-48k-01";
export const RENDER_SAMPLE_RATE = 48000;

export async function prepareRenderBuffer(audioBuffer, targetSampleRate = RENDER_SAMPLE_RATE) {
  if (!audioBuffer) throw new Error("No audio buffer available for render");
  if (targetSampleRate !== RENDER_SAMPLE_RATE) throw new Error("Render requires 48 kHz");
  if (audioBuffer.sampleRate === targetSampleRate) return audioBuffer;
  const channelCount = Math.max(1, Math.min(audioBuffer.numberOfChannels, 2));
  const left = audioBuffer.getChannelData(0);
  const right = channelCount > 1 ? audioBuffer.getChannelData(1) : left;
  const output = await prepareWavChannels(left, right, audioBuffer.sampleRate);
  let buffer;
  if (typeof AudioBuffer !== "undefined") {
    buffer = new AudioBuffer({numberOfChannels: channelCount, length: output.left.length, sampleRate: targetSampleRate});
  } else {
    const OfflineContext = globalThis.OfflineAudioContext || globalThis.webkitOfflineAudioContext;
    if (!OfflineContext) throw new Error("AudioBuffer creation is not supported by this browser");
    buffer = new OfflineContext(channelCount, output.left.length, targetSampleRate).createBuffer(channelCount, output.left.length, targetSampleRate);
  }
  buffer.copyToChannel(output.left, 0);
  if (channelCount > 1) buffer.copyToChannel(output.right, 1);
  return buffer;
}
