export const RENDER_SAMPLE_RATE = 48000;

export async function prepareRenderBuffer(audioBuffer, targetSampleRate = RENDER_SAMPLE_RATE) {
  if (!audioBuffer) throw new Error("No audio buffer available for render");
  if (audioBuffer.sampleRate === targetSampleRate) return audioBuffer;

  const OfflineContext = globalThis.OfflineAudioContext || globalThis.webkitOfflineAudioContext;
  if (!OfflineContext) throw new Error("OfflineAudioContext is not supported by this browser");

  const channelCount = Math.max(1, Math.min(audioBuffer.numberOfChannels, 2));
  const frameCount = Math.max(1, Math.round(audioBuffer.duration * targetSampleRate));
  const context = new OfflineContext(channelCount, frameCount, targetSampleRate);
  const source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(context.destination);
  source.start(0);
  return context.startRendering();
}
