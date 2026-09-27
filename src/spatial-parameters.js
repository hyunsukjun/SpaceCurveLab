export function roomMixGains(roomMix) {
  const amount = clamp(roomMix, 0, 1);
  return {
    dry: Math.cos(amount * Math.PI * 0.5),
    wet: Math.sin(amount * Math.PI * 0.5)
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
