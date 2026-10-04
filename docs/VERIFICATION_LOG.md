# Verification Log

This log preserves evidence for implementation, listening, compatibility, and
physical-output claims. A passing syntax check or HTTP response is not listening
evidence. Each entry must state what was actually observed and what remains open.

## Evidence Levels

- `STATIC`: code or document inspection only
- `AUTOMATED`: deterministic calculation, header, or regression check
- `BROWSER`: interaction verified in a named browser and operating system
- `LISTENING`: audible result assessed with a named source and monitoring chain
- `PHYSICAL`: discrete output verified on the intended speaker layout

## Entry Template

```text
Date:
Version/commit:
Evidence level:
Environment: OS, browser/app version, hardware, audio interface
Source: filename, duration, channels, sample rate, checksum/license if retained
Curves/settings:
Actions:
Expected:
Observed:
Artifacts: output filename/checksum, screenshot, console record, or none
Remaining unknowns:
```

## 2026-09-30 - Bottom Playback Bar

- **Version:** local working tree after public commit `e7b7620`
- **Evidence:** `BROWSER`, reconstructed from the completed local verification
- **Environment:** macOS, local Chrome; exact browser version and hardware were not recorded
- **Sources:** generated mono sample, a stereo MP3, and a hot stereo fixture; filenames
  and checksums were not retained
- **Verified:** Play/Pause, Stop, Spacebar, Position seek, natural-end restart,
  L/R meter response, peak hold, CLIP latch/reset, responsive layout, and WAV download
- **Not verified by this entry:** controlled sound-quality comparison, Safari/Edge,
  Windows, physical Quad/Octo output, and repeatable fixture hashes

## 2026-09-30 - Chrome Graphics Acceleration Observation

- **Evidence:** `BROWSER`, user-observed behavior plus browser GPU-status inspection
- **Symptom:** with Chrome graphics acceleration disabled, sound began promptly but
  waveform/curve/Spatial View animation stuttered and lagged behind
- **Observation:** Chrome reported software-only Canvas/compositing and disabled GPU
  features; enabling graphics acceleration removed the observed problem
- **Interpretation:** audio processing remained responsive while main-thread Canvas,
  meter, and compositing work missed visual frames
- **Code change:** none; performance optimization was explicitly deferred
- **Standalone relevance:** UI drawing and metering must not share the realtime audio
  thread. Establish a low-end hardware target and verify graceful behavior without
  relying on a specific GPU path.
- **Still required:** measured frame rate/CPU data, graphics-acceleration-off retest,
  Windows low-end hardware, and a defined acceptable visual update rate

## 2026-09-30 - Spatial Object Simplification

- **Version:** local working tree after public commit `e7b7620`
- **Evidence:** `STATIC` plus local browser visual inspection
- **Change verified:** object radius changed from 18 to 9 Canvas pixels and the
  34-point fading red motion trail is no longer drawn
- **Sound impact:** none; Direction/Distance calculation and audio paths were unchanged
- **Checks:** JavaScript syntax, diff whitespace, served `app.js`, and refreshed local
  Spatial View were checked
- **Release target:** `20260930-02`; Git history and the public asset response are
  authoritative for final publication status

## Verification Backlog

- create licensed mono and stereo 5-30 second fixtures with checksums
- record browser/OS/device versions for each release verification
- preserve representative 2/4/8-channel rendered WAV checksums and measured peaks
- test rapid Direction/Distance curves, hot input, silence, DC-heavy input, and endings
- compare Preview and Stereo Render under controlled headphone conditions
- verify channel order and perceived motion on physical Quad and Octo systems
- measure long-file render time and peak memory on minimum target hardware

## 2026-10-02 - Lightweight Web Skin

- **Version:** local working tree after public commit `26f1f7d`; cache target
  `20261002-01`
- **Evidence:** `STATIC` plus local browser layout and interaction checks
- **Scope:** CSS decoration and stylesheet cache query only
- **Removed:** two fixed `90px` blurred animated layers, background gradients,
  decorative panel/dialog/meter shadows, translucent stacked work surfaces, and
  control color transitions
- **Preserved:** all layout rules and breakpoints, Violet/Cyan/Red semantic colors,
  Canvas graphics, playhead, waveform, meter gradient and CLIP state, modal
  backdrop, controls, and audio behavior
- **Performance status:** expected to reduce decorative compositing work, but no
  low-end hardware timing, CPU, frame-rate, or power measurement was performed


## 2026-10-04 - Hub v0.10 identity pilot (uncommitted)

Scope: icon and product color only. JS syntax/hash preservation, SVG source hashes
and 3-orbit/3-point counts passed. Desktop 1294px and narrow 434px (document 419px)
checked. Default sample Play/Stop and clock reset observed in a separate tab.
Console error/warning list empty. No listening, multichannel physical output,
or new export validation claimed. User requested stop before commit.
