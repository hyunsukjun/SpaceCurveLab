// Shared wet-only room. Original implementation; no third-party DSP source.
// Orthogonal 8-line Hadamard FDN with per-delay decay and passive damping.
const DELAYS = [0.0297, 0.0371, 0.0411, 0.0437, 0.0533, 0.0613, 0.0677, 0.0793];
const INV_ROOT_8 = 1 / Math.sqrt(8);
export function safeDecay(value) { return Math.min(4, Math.max(0.3, Number(value) || 1.2)); }
export function roomSend(settings, distance, t = 0) {
  if (!settings?.enabled) return 0;
  const amount = Math.max(0, Math.min(1, Number(settings.amountCurve ? sampleRoomCurve(settings.amountCurve, t) : settings.amount) || 0));
  return amount * (settings.linked ? Math.max(0, Math.min(1, distance)) : 1);
}
function sign(row, column) {
  let bits = row & column, parity = 0;
  while (bits) { parity ^= bits & 1; bits >>>= 1; }
  return parity ? -1 : 1;
}
export class SpaceReverb {
  constructor(rate, channels = 2, decay = 1.2) {
    if (!(rate >= 8000 && rate <= 192000) || ![2, 4, 8].includes(channels)) throw new Error('Invalid room format');
    this.rate = rate;
    this.channels = channels;
    this.lines = DELAYS.map(t => new Float32Array(Math.round(t * rate)));
    this.positions = new Uint32Array(8);
    this.filtered = new Float64Array(8);
    this.read = new Float64Array(8);
    this.gains = new Float64Array(8);
    this.injection = new Float64Array(8);
    this.output = new Float64Array(channels);
    this.alpha = 1 - Math.exp(-2 * Math.PI * 6000 / rate);
    this.rows = Array.from({length: 8}, (_, r) => Float64Array.from({length: 8}, (_, c) => sign(r, c) * INV_ROOT_8));
    this.setDecay(decay);
  }
  setDecay(value) {
    const decay = safeDecay(value);
    if (decay === this.decay) return;
    this.decay = decay;
    for (let j = 0; j < 8; j++) {
      this.gains[j] = Math.pow(10, -3 * this.lines[j].length / (this.rate * decay));
      this.injection[j] = Math.sqrt(1 - this.gains[j] ** 2) * INV_ROOT_8;
    }
  }
  process(left, right = 0) {
    for (let j = 0; j < 8; j++) {
      const value = this.lines[j][this.positions[j]];
      this.filtered[j] += this.alpha * (value - this.filtered[j]);
      this.read[j] = this.filtered[j] * this.gains[j];
    }
    for (let j = 0; j < 8; j++) {
      let mixed = 0;
      for (let k = 0; k < 8; k++) mixed += this.rows[j][k] * this.read[k];
      this.lines[j][this.positions[j]] = mixed + (left + (j % 2 ? -right : right)) * this.injection[j];
      this.positions[j] = (this.positions[j] + 1) % this.lines[j].length;
    }
    for (let c = 0; c < this.channels; c++) {
      let sum = 0;
      for (let j = 0; j < 8; j++) sum += this.rows[c][j] * this.filtered[j];
      this.output[c] = sum * Math.sqrt(2 / this.channels);
    }
    return this.output;
  }
}

export function sampleRoomCurve(points, t) {
  if (t <= points[0].x) return points[0].y;
  for (let i=1; i<points.length; i++) if (t<=points[i].x) {
    const a=points[i-1], b=points[i];
    const u=(t-a.x)/Math.max(0.0001,b.x-a.x);
    return a.y+(b.y-a.y)*u*u*(3-2*u);
  }
  return points[points.length-1].y;
}
