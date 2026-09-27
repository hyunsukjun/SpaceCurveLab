const MAX_DISTANCE_WET = 0.65;

export function distanceRoomGains(distance) {
  const amount = clamp(distance, 0, 1) * MAX_DISTANCE_WET;
  return {
    dry: Math.cos(amount * Math.PI * 0.5),
    wet: Math.sin(amount * Math.PI * 0.5),
    amount
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
