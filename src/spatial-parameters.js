const MAX_DISTANCE_WET = 1;

export function distanceRoomLevels(distance) {
  const amount = clamp(distance, 0, 1) * MAX_DISTANCE_WET;
  return {
    dry: 1,
    wet: amount,
    amount
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
