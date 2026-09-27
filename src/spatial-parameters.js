export function roomAmountForDistance(distance, roomMix) {
  const safeDistance = clamp(distance, 0, 1);
  const safeRoomMix = clamp(roomMix, 0, 1);
  return safeRoomMix * (0.3 + safeDistance * 0.7);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
