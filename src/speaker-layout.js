export const speakerLayouts = {
  quad: [
    { channel: 1, angle: 315 },
    { channel: 2, angle: 45 },
    { channel: 3, angle: 225 },
    { channel: 4, angle: 135 }
  ],
  octo: [
    { channel: 1, angle: 337.5 },
    { channel: 2, angle: 22.5 },
    { channel: 3, angle: 67.5 },
    { channel: 4, angle: 112.5 },
    { channel: 5, angle: 157.5 },
    { channel: 6, angle: 202.5 },
    { channel: 7, angle: 247.5 },
    { channel: 8, angle: 292.5 }
  ]
};

export function getSpeakerLayout(format) {
  return speakerLayouts[format] || speakerLayouts.quad;
}
