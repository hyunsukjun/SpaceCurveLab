# DSP Behavior

Baseline: 2026-09-30 current implementation.

## Musical Intent

Direction describes accumulated horizontal rotation. Distance is a compact
perceptual macro: Far should sound less direct, darker, wider in diffuse energy,
and visually farther from the listener without exposing multiple engineering
controls. The prototype favors understandable, stable browser-standard processing
over a calibrated room simulator.

## Shared Curve Evaluation

For normalized time `t`, adjacent points `a` and `b` are evaluated with:

```text
u = clamp-like segment position = (t - ax) / max(0.0001, bx - ax)
eased = u^2 * (3 - 2u)
value = ay + (by - ay) * eased
```

Before the first point and after the last point, endpoint values are held.

```text
directionDegrees = normalizedDirection * 3600 - 1800
distance = clamp(normalizedDistance, 0, 1)
roomWetAmount = distance
```

This mapping is shared conceptually by Preview and Render. Implementations differ
after the mapped values are produced.

## Realtime Headphone Preview

### Signal Flow

```text
AudioBufferSource
  -> ChannelSplitter (first 1 or 2 channels)
  -> per-channel input Gain
  -> Distance processor
       bypass path -> PannerNode
       direct Gain -> low-pass -> PannerNode
       wet Gain -> Convolver -> PannerNode
  -> preview master Gain
  -> stereo output meter tap (measurement only)
  -> audio destination
```

The output meter uses two `AnalyserNode` time-domain readers with FFT size 1024.
It calculates per-channel sample peak and RMS, and flags CLIP at linear peak
`>= 0.999`. The meter input has unity gain and is connected in series to the
destination, so it does not intentionally alter the Preview signal.

### Direction And Input Channels

- Mono creates one point source at Direction.
- Stereo creates linked sources at Direction minus 45 degrees and Direction plus
  45 degrees. Stereo Width is not exposed.
- Panner model is `HRTF`.
- Position is `(sin(angle) * radius, 0, -cos(angle) * radius)`.
- `radius = 1 + 3.5 * distance`.
- Panner distance settings are linear, reference 1, maximum 6, rolloff 0. Custom
  Distance gain therefore comes from the Distance processor, not Panner rolloff.
- Panner position targets use a 25 ms time constant after initial placement.

### Distance Processor

Let `d = clamp(distance, 0, 1)`:

```text
directGain = 1 - 0.48d
lowPassCutoffHz = 19000 - 9500d
lowPassQ = 0.45
wetGain = 0.4d
```

Target time constants are 35 ms direct, 45 ms cutoff, and 60 ms wet. Bypass sets
the unity bypass path to 1, processed direct/wet paths to 0, and effective room
amount to zero. Parameter switching itself uses a 20 ms target on bypass gain.

### Generated Room Impulse

- stereo impulse, duration 1.15 seconds
- deterministic pseudo-random seed `19790217`
- envelope `(1 - normalizedTime)^2.8`
- first 80 ms uses early coefficient 1; remainder coefficient 0.35
- global sample multiplier 0.28

The impulse is synthetic and copyright-independent. It is a prototype room cue,
not a measured space or physically calibrated reverberator.
The exact random-generator contract required to reproduce this impulse on another
platform is specified in `REFERENCE_FIXTURES.md`.

### Preview Boundary Safety

- Master gain ramps from 0 to 0.9 and back to 0.
- Maximum boundary fade is 8 ms; very short remaining durations use 25% of duration.
- Stop/Pause ramps down over 8 ms and stops the source at 9 ms.
- No limiter is present in the realtime graph. Current gain staging is conservative,
  but clipping must be checked with hot user material.

## Offline Stereo Render

Stereo input is averaged to mono before spatial rendering:

```text
dry = monoInput or (left + right) / 2
pan = sin(directionRadians)
width = 1 - 0.32d
direct = 1 - 0.42d
leftGain  = cos((pan * width + 1) * pi / 4) * direct
rightGain = sin((pan * width + 1) * pi / 4) * direct
```

The direct sample passes through a one-pole low-pass with the same
`19000 - 9500d` cutoff. A deterministic two-delay diffuse network is added:

- left delays: 37 ms and 71 ms
- right delays: 41 ms and 83 ms
- room input: `dry * 0.35`
- output taps: `0.5` and `0.28`, multiplied by `d`
- feedback/cross terms: `0.34` and `-0.25` as implemented

This is a general-listening/headphone spatial result, not binaural HRTF parity
with Preview and not a fold-down of the discrete speaker renderer.

## Offline Quad And Octo Render

Mono is one point source. Stereo stays a linked pair at Direction minus/plus 45
degrees. For each source and speaker:

```text
weight = max(0, cos(angularDistance))
normal = sqrt(sum(weight^2)) or 1
speakerDirect = lowPassedSample * (1 - 0.48d) * 0.85 * weight / normal
```

Per-output-channel diffuse state uses 43 ms and 79 ms delays:

- room input: original source sample `* 0.3`
- output taps: `0.58` and `0.32`, multiplied by `d`
- feedback terms: `+0.36` and `-0.29`

Speaker angle convention is 0 degrees front and positive clockwise.

| Format/channel | Angle | Position |
| --- | ---: | --- |
| Quad 1 | 315 deg | front-left |
| Quad 2 | 45 deg | front-right |
| Quad 3 | 225 deg | rear-left |
| Quad 4 | 135 deg | rear-right |
| Octo 1 | 337.5 deg | front-left, about 11 o'clock |
| Octo 2 | 22.5 deg | front-right, about 1 o'clock |
| Octo 3 | 67.5 deg | right-front/side |
| Octo 4 | 112.5 deg | right-rear |
| Octo 5 | 157.5 deg | rear-right |
| Octo 6 | 202.5 deg | rear-left |
| Octo 7 | 247.5 deg | left-rear/side |
| Octo 8 | 292.5 deg | left-front |

Channel order in the WAV is array order shown above.

## WAV Encoding And Safety

- decoded input is prepared at 48 kHz with `OfflineAudioContext` before spatial
  rendering; already-48 kHz buffers bypass this preparation step
- output frame count is `round(inputDuration * 48000)`, preserving duration
- interleaved RIFF/WAVE, PCM format 1, signed 24-bit little-endian
- 8 ms linear fade at both boundaries
- peak scan includes the boundary envelope
- if peak exceeds 0.98, all channels receive `0.98 / peak`; quieter renders are
  not normalized upward
- per-sample clamp to `-1..1`
- no dither, metadata, WAVE_FORMAT_EXTENSIBLE channel mask, or tail extension

The render ends at the resampled input duration, so delay/reverb tails after source
end are truncated. This is a known product decision/risk to evaluate before Standalone.

## Preview / Render Parity

| Area | Preview | Render | Audible risk |
| --- | --- | --- | --- |
| Curves/ranges | normalized smoothstep | same | low |
| Distance room mapping | linear `d` | linear `d` | low at macro level |
| Direction | browser HRTF Panner | deterministic pan/speaker weights | high |
| Reverb | 1.15 s convolution IR | short delay networks | high |
| Parameter smoothing | Web Audio target times | frame sampling/filter state | medium |
| Stereo input | linked HRTF pair | mono downmix in 2ch render; linked pair in 4/8ch | high for 2ch |
| Master/boundary gain | 0.9, up to 8 ms | ceiling 0.98, 8 ms | medium |
| Sample rate | active AudioContext/device rate | fixed 48 kHz | low/medium; resampler implementation may vary |
| Randomness | deterministic IR seed | deterministic/no random stage | low repeatability risk |
| Tail length | IR runs inside source duration | output truncated at source length | medium/high at ending |

Automated mapping tests do not establish perceptual parity. Current stereo Preview
was reported as plausible, but controlled headphone comparison and real Quad/Octo
speaker tests remain required.

## Known Limitations And Unknowns

- browser HRTF and decode behavior vary by engine/OS
- realtime graph has no explicit limiter or DC blocker
- offline renderer is synchronous and memory-heavy for long multichannel files
- 24-bit export has no dither or multichannel channel mask
- reverb tail is truncated to source length
- speaker renderer is not room-calibrated and has no bass management
- rapid curve motion, extreme input levels, DC-heavy files, and physical speaker
  gain consistency need broader testing
- current perceptual sweet spots are `NEEDS LISTENING TEST`
