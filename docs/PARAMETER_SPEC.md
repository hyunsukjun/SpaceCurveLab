# Parameter Specification

Baseline: 2026-09-30 current implementation.

## Stable Product Parameters

### `direction`

- **Display name:** Direction
- **Module/purpose:** Space; cumulative horizontal rotation trajectory
- **Type/unit:** continuous curve, degrees
- **Range/default:** `-1800..+1800 deg`; default `0 deg`
- **Normalized range:** `0..1`; `0.5` is `0 deg`
- **Mapping:** `degrees = normalizedY * 3600 - 1800`
- **Display mapping:** axis at every 360 degrees from `-5 CCW` to `+5 CW`
- **Curve support:** yes; endpoints at normalized time 0 and 1
- **Interpolation:** smoothstep per segment, `u = t^2(3 - 2t)`
- **Smoothing:** realtime Panner positions use a `25 ms` target time constant;
  offline render samples every output frame without additional parameter smoothing
- **Resolution:** continuous internally; readout rounds to whole degrees
- **Automation intent:** full-source trajectory; slope expresses rotation speed
- **Preview:** modulo 360 degrees for HRTF position; accumulated value remains in UI
- **Render:** modulo behavior emerges from sine/cosine/angular distance
- **Edge cases:** steep segments can rotate rapidly; no speed limiter
- **Perceptual tuning:** useful speed and extreme-motion limits are `UNKNOWN` and
  require listening tests with representative material
- **Version:** 1

### `distance`

- **Display name:** Distance
- **Module/purpose:** Space; Near-to-Far depth trajectory
- **Type/unit:** continuous curve, normalized perceptual amount
- **Range/default:** `0..1`; default `0`
- **Display mapping:** `0 Near`, `0.5`, `1 Far`
- **Mapping:** identity after clamp; internal DSP relationships are below
- **Curve support/interpolation:** yes; same normalized smoothstep model as Direction
- **Preview smoothing:** direct `35 ms`, low-pass `45 ms`, wet `60 ms`; object
  position `25 ms`
- **Render smoothing:** per-frame smoothstep curve value; filter has sample-state
  continuity; no separate parameter time constant
- **Preview relationships:** radius `1 + 3.5d`; direct gain `1 - 0.48d`;
  low-pass cutoff `19000 - 9500d Hz`; room send `0.4d`
- **Stereo render relationships:** width `1 - 0.32d`; direct pan gain multiplier
  `1 - 0.42d`; low-pass cutoff `19000 - 9500d Hz`; room amount `d`
- **Quad/Octo render relationships:** direct multiplier `(1 - 0.48d) * 0.85`;
  same cutoff; room amount `d`
- **Edge cases:** Far retains direct sound under the current linear-send design;
  this is not a literal meter-distance or calibrated acoustic model
- **Perceptual tuning:** the 2026-09-27 sequence changed the automatic room maximum
  from 65% to 100%, then replaced equal-power crossfade with a linear wet send so
  the first half of the curve is more audible and direct sound remains present
- **Listening status:** user reported the earlier response felt too concentrated
  near Far; current mapping is approved directionally but needs broader material,
  headphone, and speaker tests
- **Version:** 2

### `distanceBypass`

- **Display name:** Distance Bypass
- **Type/unit:** boolean
- **Default:** false
- **Mapping:** false = evaluate Distance; true = effective Distance 0 and bypass
  realtime Distance filter/direct/wet graph through unity bypass path
- **Curve support:** no; Distance curve data remains stored
- **Preview/Render:** Direction remains active; room amount is zero; no Distance LPF
- **Edge case:** bypass is comparison behavior, not a global spatial bypass
- **Version:** 1

### `renderFormat`

- **Display name:** Render format
- **Type:** enumeration
- **Values/default:** `stereo` (default), `quad`, `octo`
- **Outputs:** 2, 4, or 8 interleaved WAV channels
- **Preview behavior:** selector changes Spatial View labels/readout; realtime audio
  remains headphone HRTF rather than opening physical multichannel output
- **Render behavior:** selects stereo or discrete offline algorithm and layout
- **Version:** 1

### `renderSampleRate`

- **Display name:** not exposed
- **Type/unit:** fixed integer, Hz
- **Value:** `48000`
- **Purpose:** consistent DAW, video, and multichannel installation interchange
- **Mapping:** decoded input duration is preserved; output frame count is
  `round(duration * 48000)`
- **Preview behavior:** none; Preview remains at the active AudioContext rate
- **Render behavior:** non-48 kHz input is prepared through OfflineAudioContext
- **Version:** 1

### `renderBitDepth`

- **Display name:** not exposed
- **Type/unit:** fixed integer, bits per PCM sample
- **Value:** `24`
- **Purpose:** retain low-level precision and reduce quantization error during
  subsequent DAW and video workflows; 24-bit does not raise the 0 dBFS ceiling
- **Encoding:** signed 24-bit little-endian PCM in a RIFF/WAVE container
- **Preview behavior:** none
- **Render behavior:** applies to Stereo, Quad, and Octo WAV output
- **Version:** 1

## Curve Data Contract

- Point: `{x: normalizedTime, y: normalizedValue}`
- Time range: `0..1` inclusive
- Value range: `0..1` inclusive
- Minimum points: two protected temporal endpoints
- Ordering: ascending `x`
- Segment evaluation: smoothstep interpolation
- Metadata/schema: not currently persisted
- Proposed future identity: schema version plus product, module, curves, parameters,
  and settings; no current file format is changed by this documentation

## Internal Fine-Tuning Constants

These values are product knowledge even though they are not public controls.

| ID | Value | Role |
| --- | --- | --- |
| `stereoSpreadDegrees` | `45 deg` per side | linked stereo input pair |
| `previewMasterLevel` | `0.9` | realtime output ceiling target |
| `previewBoundaryFade` | up to `8 ms` | click reduction at start/end |
| `renderBoundaryFade` | `8 ms` | WAV start/end envelope |
| `renderPeakCeiling` | `0.98` | attenuation only when peak exceeds ceiling |
| `previewImpulseDuration` | `1.15 s` | generated convolution room |
| `previewImpulseSeed` | `19790217` | deterministic room impulse |
| `defaultSampleSeed` | `45066` | deterministic noise sample |
| `pointHitRadius` | `10 Canvas px` | current web interaction implementation |

The exact random generator, envelope shape, numerical mapping fixtures, meter
ballistics, and export contracts are preserved in `REFERENCE_FIXTURES.md`. A seed
without its generator algorithm is not a reproducible cross-platform fixture.

## Generated Default Sample

| Setting | Value |
| --- | --- |
| Duration | `45 s` |
| Noise burst | `0.045833 s` |
| Gap | `0.020833 s` |
| Nominal cycle | about `0.066666 s` |
| Attack | `0.003 s` |
| Decay | `0.014 s` |
| Sustain | `0.22` |
| Release | `0.018 s` |
| Gain | `0.32` |
| Channels | mono |

Frame conversion uses floor at the active `AudioContext` sample rate, so exact
sample counts and cycle duration vary slightly with sample rate.

## Fine-Tuning Still To Document

- preferred Direction speeds for slow, medium, and rapid musical motion
- Distance sweet spot after the current linear room-send change
- acceptable coloration and diffuse level on different headphones
- gain calibration across real Quad and Octo systems
- whether the linked stereo spread should remain 45 degrees per side in Standalone
- listening-based parity tolerance between Preview and each render format
