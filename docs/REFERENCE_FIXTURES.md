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

## 2026-10-06 — Band-limited Render preparation (local, unpublished)

Decoded PCM is converted to 48 kHz with a 96-tap Blackman-windowed sinc before the unchanged spatial DSP. Already-48 kHz input bypasses conversion. Mono/stereo count is retained; output length is round(sourceFrames * 48000 / sourceRate). No parameter, speaker order, Preview, fade or gain changes.

Browser preparation/encoding tests: 30 passed, including four rates, mono/stereo input and stereo/quad/octo WAV headers and duration. 30 kHz rejection: 88.2→48 kHz -90.17 dB; 96→48 kHz -98.35 dB. Previously -3.12 dB and 0 dB respectively in the tested in-app browser. Test: tests/browser-render-resampling.html; converter checks: tests/render-resampling.mjs. These are synthetic numerical checks, not physical-speaker/listening, long-file or cross-browser certification.

## 2026-10-06 — Stereo Render input preservation (local candidate)

User authorized eliminating stereo mono-sum loss and avoiding severe cancellation. Two-channel export now has a separate linked-stereo branch; mono and 4/8ch code paths are unchanged. Each source has independent low-pass and two-channel diffuse state. Each contributes at gain 0.5 before the existing distance mapping and output ceiling. The mono-sum equations above describe the historical dc7e78e stereo-input path only.

Let theta be Direction radians and w=1-0.32d. halfSpan=max(0.5,abs(cos(theta))*sqrt(0.5)*w); center=clamp(sin(theta)*sqrt(0.5)*w,-1+halfSpan,1-halfSpan). Left/right source pans are center-halfSpan and center+halfSpan, followed by the existing equal-power cosine/sine gains. The gap floor and fixed source order intentionally prevent the direct two-by-two mix matrix from becoming singular at side positions. This is a stereo projection with limited lateral concentration, NOT literal rear source swapping or HRTF parity. The floor is an engineering candidate, not a listening-approved parameter. No artificial decorrelation, phase inversion, or input-dependent normalization is introduced.

QA: 864 fixed-angle 48k/24-bit WAV cases (0/90/180-degree source phase, 72 angles, bypass on/off, Distance 0/1). No complete loss, and tested rotation RMS span <3dB (anti-phase worst 2.784dB). Mono stereo/quad/octo and stereo quad/octo: 10 byte-identical cases against dc7e78e. L-only/R-only survive; hot rotating input stays within 0.98 ceiling. These narrow tone fixtures do not certify arbitrary music, frequency-dependent cancellation, physical speakers, or moving-curve listening. Browser anti-phase file loading, Play and render completion passed with no warning/error logs; download-event timed out, so actual disk persistence/reopen is NOT verified this turn. Resampling regression passed.

Evidence and repeatable QA are in the family workspace: SPACE_STEREO_SAFETY_CHANGE.md, qa/space-stereo-safety.mjs, evidence/space-stereo-safety.json. No commit/deployment yet. Multichannel shared diffuse state remains a separate pending investigation.

## 2026-10-06 — Moving stereo follow-up

`tests/stereo-motion.mjs`: 36 conditions (80/997/10000 Hz × source phase 0/90/180 degrees × Distance 0/1 × clockwise/counterclockwise). Each 4-second curve traverses one full turn. Interior 50ms stereo-energy windows, excluding 100ms at each boundary, remain non-silent; minimum RMS 0.008842, maximum within-case window range 2.801dB. WAV length/rate/24-bit and ceiling pass. These are synthetic steady tones, not an all-signal or listening guarantee.

Browser QA using the product renderer generates a moving anti-phase WAV and re-decodes it as 2ch/48k/2s; header 24-bit, 576044 bytes, peak 0.04108. In-app browser download and downloadMedia time out, so normal browser-download persistence remains unverified. Separately, the same product renderer in Node writes an actual WAV to disk; opening that file in the app shows 2 seconds/2ch, Play advances the cursor and both meters, natural end restores Play, no console warnings/errors. This verifies disk WAV readability and playback lifecycle, not the browser download path or perceptual quality. Evidence: family workboard evidence/space-stereo-motion.json, space-stereo-motion-render.wav, space-stereo-reopened.png. Listening on real stereo material remains pending. No further product DSP change in this follow-up.
