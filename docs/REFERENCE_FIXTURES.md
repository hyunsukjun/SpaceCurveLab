# Reference Fixtures And Numerical Contracts

This document defines portable calculations and future regression fixtures. It does
not contain copyrighted audio and does not claim that the current sonic tuning is
final. Generated WAV files and hashes are still to be captured.

## Curve Evaluation

For segment endpoints `a` and `b` and normalized segment position `u`:

```text
u = (t - ax) / max(0.0001, bx - ax)
smooth = u * u * (3 - 2 * u)
value = ay + (by - ay) * smooth
```

| `u` | smoothstep |
| ---: | ---: |
| 0 | 0 |
| 0.25 | 0.15625 |
| 0.5 | 0.5 |
| 0.75 | 0.84375 |
| 1 | 1 |

Direction mapping fixtures: normalized values `0, 0.25, 0.5, 0.75, 1` map to
`-1800, -900, 0, 900, 1800 degrees`. Distance is the normalized value clamped to
`0..1`.

## Distance Mapping Fixtures

| Distance | Preview direct | Cutoff Hz | Preview wet | Preview radius | Stereo width | Stereo direct | Quad/Octo direct factor |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 1 | 19000 | 0 | 1 | 1 | 1 | 0.85 |
| 0.5 | 0.76 | 14250 | 0.2 | 2.75 | 0.84 | 0.79 | 0.646 |
| 1 | 0.52 | 9500 | 0.4 | 4.5 | 0.68 | 0.58 | 0.442 |

Preview parameter target time constants are 20 ms for bypass switching, 25 ms for
position, 35 ms for direct gain, 45 ms for cutoff, and 60 ms for room send.

## Deterministic Random Generator

Both generated noise and the room impulse use the same unsigned 32-bit linear
congruential generator. A native port must preserve unsigned overflow behavior:

```text
state = (state * 1664525 + 1013904223) modulo 2^32
random = state / 4294967296
```

- default noise seed: `45066`
- room impulse seed: `19790217`
- room impulse uses one continuing generator sequence across both channels; it is
  not reset at the second channel

## Generated Default Sample

- duration `45 s`, mono, active device sample rate
- burst `0.045833 s`, gap `0.020833 s`, nominal cycle about `0.066666 s`
- attack `0.003 s`, decay `0.014 s`, sustain `0.22`, release `0.018 s`
- output gain `0.32`
- seconds-to-frame conversion uses floor
- envelope uses linear attack from zero to one, linear decay from one to sustain,
  sustain hold, and linear release from sustain to zero

At 48 kHz, a 45-second Render has `2,160,000` frames per output channel. The
generated source itself follows the active AudioContext rate before Render preparation.

## Room Impulse Contract

- stereo, `1.15 s`, frame count `floor(sampleRate * 1.15)`
- sample envelope `(1 - i/length)^2.8`
- coefficient `1` for the first `80 ms`, then `0.35`
- final sample multiplier `0.28`
- generated sample is `(random * 2 - 1) * envelope * coefficient * 0.28`

## Speaker Layout Contract

| Output | Channel angles in WAV order |
| --- | --- |
| Quad | `1@315, 2@45, 3@225, 4@135 degrees` |
| Octo | `1@337.5, 2@22.5, 3@67.5, 4@112.5, 5@157.5, 6@202.5, 7@247.5, 8@292.5 degrees` |

Zero degrees is front and positive angles move clockwise. Discrete direct weights
are `max(0, cos(angularDistance))`, normalized by the root-sum-square of active
speaker weights.

## WAV Contract

- Stereo, Quad, or Octo interleaved PCM RIFF/WAVE
- fixed `48,000 Hz`, signed 24-bit little-endian samples
- frame count `round(decodedDuration * 48000)`
- 8 ms linear fade at start and end
- shared attenuation only if enveloped peak exceeds `0.98`
- no upward normalization, dither, channel mask, metadata, or tail extension

## Meter Display Contract

- measurement window: 1024 samples per channel, no AnalyserNode smoothing
- CLIP threshold: linear peak `0.999`, latched until user reset
- display range: `-60..0 dBFS`
- peak display attack/release: `18/320 ms`
- RMS display attack/release: `45/420 ms`
- peak hold: `1000 ms`; subsequent hold release: `700 ms`

These meter ballistics are UI feedback, not DSP applied to the audio signal.

## Artifacts Still Required

- generated default-sample PCM checksum at one fixed sample rate
- generated room-impulse PCM checksum at 48 kHz
- fixed curve JSON fixtures for neutral, extreme, and rapid motion
- licensed mono/stereo source manifest with checksums
- representative Stereo/Quad/Octo WAV files, peaks, frame counts, and checksums
- controlled listening notes linked to the exact fixture and version
