# Standalone Migration Knowledge

Baseline: 2026-09-30 current implementation.

## Objective

The goal is not to transplant HTML or Web Audio code. The goal is to reproduce
the approved musical behavior, parameter response, curves, interactions, speaker
mapping, and fine-tuning in a macOS Standalone application and, if later needed,
an audio plug-in environment.

No native framework, language, or plug-in format is selected by this document.

## Portable Product Core

The following concepts should survive platform replacement:

- stable product identity: Space Curve Lab
- normalized curve points and smoothstep interpolation
- Direction/Distance IDs, ranges, units, defaults, and mappings
- Pen/Eraser semantics and protected temporal endpoints
- mono point source and stereo linked-pair meaning
- Distance macro relationships and tuning history
- Stereo/Quad/Octo output roles and speaker channel order
- transport and natural-end/restart behavior
- deterministic default sample and repeatable test fixtures
- distinction between Preview and discrete render
- Violet brand plus semantic Direction/Distance colors

## Feature Migration Matrix

### Curve Editor

- **Current web implementation:** Canvas 2D plus Pointer Events
- **Platform-independent behavior:** normalized time/value points, active curve,
  smoothstep trajectory, endpoint protection, Pen/Eraser/modifier erase
- **Reusable data/algorithm:** point arrays, sort, mapping, interpolation
- **Web-specific dependency:** DOM events, CSS pixels, Canvas hit radius/cursor
- **Standalone replacement:** native drawing/input layer and accessible editing
- **Risk/priority:** medium / P0 product behavior

### Audio File Loading

- **Current:** File input and `decodeAudioData`
- **Requirement:** local mono/stereo decode with explicit unsupported-file errors
- **Reusable data:** decoded PCM, sample rate, channels, frame count
- **Replacement:** native audio-file decoder
- **Risk/priority:** medium / P0

### Transport

- **Current:** `AudioBufferSourceNode`, `AudioContext.currentTime`, animation frame
- **Requirement:** sample-accurate source position, pause/resume, stop-to-zero,
  natural end and immediate restart, synchronized visual playhead
- **Replacement:** native audio callback/transport clock and UI timer
- **Risk/priority:** high / P0

### Playback Bar And Output Meter

- **Current:** responsive HTML controls plus a Web Audio stereo analyzer after the
  Preview master; Position restarts the source graph at the selected offset.
- **Requirement:** one authoritative time display, synchronized audible/visual
  seek, per-channel RMS/peak/hold, and user-resettable latched clipping evidence.
- **Replacement:** native transport slider and a lock-free meter fed from the final
  monitor bus; meter values must cross the audio/UI boundary without blocking.
- **Scope rule:** monitor the active listening bus, not an unplayed offline render.
- **Risk/priority:** medium / P1

### Headphone Preview

- **Current:** browser HRTF `PannerNode` and generated convolution
- **Requirement:** convincing horizontal motion and Distance macro with the documented
  parameter response; exact browser HRTF is not inherently the target
- **Reusable:** Direction/Distance mappings, stereo spread, impulse-generation
  specification, smoothing targets
- **Replacement:** selected native binaural/HRTF engine plus native reverb/filter
- **Risk/priority:** high / P0; controlled A/B listening required

### Distance DSP

- **Current:** Web Audio gain, biquad, convolver; offline one-pole/delay networks
- **Requirement:** preserve approved perceptual response and history rather than
  blindly duplicating node internals
- **Reusable:** cutoff/direct/wet formulas, smoothing values, seeds, listening notes
- **Replacement:** native DSP components with measured parity fixtures
- **Risk/priority:** high / P0

### Stereo Render

- **Current:** synchronous JavaScript, mono downmix, deterministic pan/delay network
- **Requirement:** 2ch general-listening spatial output with documented boundaries
- **Open question:** preserve current mono downmix exactly or improve stereo image
  through a versioned product decision
- **Risk/priority:** high / P1

### Quad/Octo Render

- **Current:** Float32 channel arrays, cosine weights, fixed delay tanks, PCM encoder
- **Requirement:** exact channel order/angles, full input length, safe levels, and
  reproducible movement on physical layouts
- **Replacement:** offline native renderer and standards-aware multichannel writer
- **Risk/priority:** high / P0; physical speaker test fixtures required

### Render Preparation And WAV Export

- **Current:** browser-standard OfflineAudioContext resampling to 48 kHz, followed
  by 24-bit PCM RIFF Blob encoding; no extensible channel mask; main-thread spatial render
- **Requirement:** reliable downloadable/exported file with documented channel map
- **Replacement:** high-quality native 48 kHz resampler, file dialog, and 24-bit
  audio-file writer; consider WAVE_FORMAT_EXTENSIBLE, channel metadata, dither,
  cancellation, progress, and measured resampler parity
- **Risk/priority:** medium/high / P1

### Spatial View And Waveform

- **Current:** Canvas 2D; RMS waveform normalized for display
- **Requirement:** synchronized reference visualization; not source data
- **Reusable:** visual semantics, speaker angles, RMS-bucket definition
- **Replacement:** native GPU/2D drawing; independent of DSP thread
- **Risk/priority:** low/medium / P2

The current Spatial View intentionally shows only the present object position; the
earlier fading motion trail was removed because it obscured the primary position
cue. Preserve this semantic choice, not the current Canvas pixel dimensions.

### Design System

- **Current:** CSS custom properties and responsive media queries
- **Requirement:** preserve token roles, hierarchy, identity/semantic color split,
  focus/disabled/hover meaning, and Canvas priority
- **Replacement:** native design tokens and accessibility states
- **Risk/priority:** low / P2 after audio core

## Threading And Realtime Safety

The web prototype is not a template for a native realtime audio thread. A native
implementation must avoid allocation, file I/O, locks, UI access, and unbounded
work in the audio callback. Curve edits should publish immutable or safely swapped
data. Offline render should run away from the UI thread with progress/cancellation.

The web prototype has exhibited visual stutter in Chrome when graphics acceleration
was disabled while audio remained responsive. Native UI rendering, waveform caching,
meter updates, and transport drawing must be scheduled independently from the audio
callback and verified on a defined minimum machine. This observation does not set a
native frame-rate target; that target remains to be measured.

## Proposed Future State Schema

No current preset format exists. A future versioned format should describe meaning,
not pixels or framework objects:

```json
{
  "schemaVersion": 1,
  "product": "space-curve-lab",
  "module": "space",
  "curves": {
    "direction": [{ "time": 0, "value": 0.5 }],
    "distance": [{ "time": 0, "value": 0 }]
  },
  "parameters": {
    "distanceBypass": false,
    "renderFormat": "stereo"
  }
}
```

This is a migration proposal, not an implemented file format. Endpoint completion,
audio-file references, schema evolution, and validation rules remain to be decided.

## Parity Fixtures To Preserve

The executable numerical contracts and missing-artifact list are maintained in
`REFERENCE_FIXTURES.md`. Verification evidence belongs in `VERIFICATION_LOG.md`, and
perceptual evidence belongs in `LISTENING_NOTES.md`.

- deterministic 45-second default sample (seed 45066)
- fixed Direction and Distance test curves, including extreme and rapid transitions
- mono and stereo 5-30 second real-file fixtures where licensing permits
- expected curve samples at known normalized times
- expected 2/4/8 channel count, fixed 48 kHz rate, duration-derived frame count,
  24-bit sample encoding, boundary envelope, and
  peak ceiling behavior
- impulse-generation fixture (seed 19790217)
- documented speaker-angle/channel table
- reference listening notes captured with monitoring environment and date

## Migration Gates

1. Freeze and version parameter/curve/state specifications.
2. Establish numerical fixtures for mappings, interpolation, layout, and export.
3. Capture controlled listening references and current web renders, with source and
   output checksums linked to the exact version.
4. Implement transport and curves independently of UI toolkit.
5. Implement DSP with objective comparison and listening approval.
6. Verify Stereo headphones and physical Quad/Octo systems.
7. Implement native UI using portable design tokens.
8. Decide plug-in scope only after Standalone behavior is stable.

## Unknown / To Be Documented

- target macOS minimum version and hardware baseline
- native framework/language and audio/DSP libraries
- plug-in formats and host automation requirements
- licensing for any future HRTF dataset or DSP dependency
- objective/perceptual tolerance for web/native parity
- long-file and multichannel memory/performance targets
- minimum macOS hardware and acceptable UI/audio performance targets
- accessibility and keyboard-editing requirements for curve points
- preset ownership of source-audio paths and missing-file recovery

## Identity Asset Pilot

STANDALONE ASSET: `assets/identity/space-app.svg` plus symbol/micro and canonical
palette. Native Dock rendering remains unverified.

## 2026-10-06 — Band-limited Render preparation (local, unpublished)

Decoded PCM is converted to 48 kHz with a 96-tap Blackman-windowed sinc before the unchanged spatial DSP. Already-48 kHz input bypasses conversion. Mono/stereo count is retained; output length is round(sourceFrames * 48000 / sourceRate). No parameter, speaker order, Preview, fade or gain changes.

Browser preparation/encoding tests: 30 passed, including four rates, mono/stereo input and stereo/quad/octo WAV headers and duration. 30 kHz rejection: 88.2→48 kHz -90.17 dB; 96→48 kHz -98.35 dB. Previously -3.12 dB and 0 dB respectively in the tested in-app browser. Test: tests/browser-render-resampling.html; converter checks: tests/render-resampling.mjs. These are synthetic numerical checks, not physical-speaker/listening, long-file or cross-browser certification.
