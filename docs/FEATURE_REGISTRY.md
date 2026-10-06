# Feature Registry

Baseline: 2026-09-30 current implementation.

Status vocabulary: `IDEA`, `PROPOSED`, `APPROVED`, `IMPLEMENTED`, `VERIFIED`,
`DEPRECATED`. `VERIFIED` means the stated evidence exists; it does not imply an
unrecorded listening or physical-speaker test.

## SCL-F001 - Local Audio Input

- **Category:** Common
- **Status:** IMPLEMENTED
- **Purpose:** Replace the default sample with a musician's mono or stereo audio.
- **User behavior:** Open Audio selects a local file; successful decode replaces
  the current buffer and resets transport position.
- **Input/Output:** Browser-supported audio file -> in-memory `AudioBuffer`.
- **Platform-independent requirement:** no server upload; preserve duration and
  the first one or two channels; convert Render input to 48 kHz.
- **Edge cases:** decode failure clears the current buffer and reports an error.
- **Tests:** real WAV/MP3 loading remains required for each release environment.

## SCL-F002 - Generated Default Noise Interval

- **Category:** Common
- **Status:** VERIFIED
- **Purpose:** Make the instrument immediately playable and expose spatial motion
  with a repeatable transient-rich source.
- **Behavior:** deterministic 45-second mono white-noise burst sequence is created
  in the browser; opening a file replaces it.
- **Data:** settings and seed are specified in `PARAMETER_SPEC.md`.
- **Dependency:** platform audio-buffer allocation only; no audio asset.

## SCL-F003 - Transport And Timeline

- **Category:** Common
- **Status:** VERIFIED
- **Purpose:** Play, pause, stop, restart, and show current/total time.
- **Behavior:** Play becomes Pause; Pause preserves position; Stop returns to zero;
  natural end returns to zero; Spacebar toggles Play/Pause outside text entry.
- **Processing:** a new source graph is built for every playback start.
- **Edge cases:** positions within 20 ms of the end restart at zero.

## SCL-F004 - Normalized Curve Editor

- **Category:** Common
- **Status:** VERIFIED
- **Purpose:** Represent a parameter trajectory over the entire source duration.
- **Data model:** ordered normalized points `{x: 0..1, y: 0..1}`.
- **Behavior:** Pen adds or moves points; Eraser deletes existing interior points;
  endpoint time positions are protected; inactive curves remain visible.
- **Processing:** segment interpolation is smoothstep.
- **Platform-independent requirement:** pixels and viewport size are not product data.
- **Edge cases:** duplicate or nearly equal interior `x` values are not prevented.

## SCL-F005 - Direction Curve

- **Category:** Space-specific
- **Status:** VERIFIED
- **Purpose:** Draw cumulative horizontal rotation through time.
- **Range:** `-1800..+1800 deg`, equivalent to `-5..+5` rotations.
- **Meaning:** positive is clockwise; negative is counterclockwise; slope is
  rotation speed; accumulated value is total rotation offset.
- **Default:** `0 deg` for the full duration.
- **Output:** realtime HRTF position, visual sound-object angle, and offline pan.

## SCL-F006 - Distance Curve

- **Category:** Space-specific
- **Status:** VERIFIED at calculation level; NEEDS LISTENING TEST for final tuning
- **Purpose:** Draw Near-to-Far perceptual depth without exposing internal filters
  or room parameters.
- **Range/default:** `0 Near..1 Far`; default `0`.
- **Processing:** direct attenuation, high-frequency reduction, increased radius,
  and a linearly increasing room send.
- **Fine-tuning:** latest change made room-send perception more linear while
  retaining direct sound at Far.

## SCL-F007 - Distance Bypass

- **Category:** Space-specific
- **Status:** VERIFIED
- **Purpose:** Compare directional motion with and without Distance processing.
- **Behavior:** preserves the Distance curve but evaluates effective Distance as
  zero and bypasses filtering/room processing. Direction panning remains active.
- **Default:** off.

## SCL-F008 - Headphone Preview

- **Category:** Space-specific
- **Status:** IMPLEMENTED; subjective parity not verified
- **Purpose:** Audition Direction and Distance using ordinary stereo headphones.
- **Input behavior:** mono is one point source; stereo is a linked pair at
  Direction `-45 deg` and `+45 deg`.
- **Processing:** Web Audio HRTF `PannerNode` plus modular Distance processing.
- **Limitation:** browser HRTF is implementation-dependent and is not the actual
  Quad/Octo renderer or proof of physical-speaker behavior.

## SCL-F009 - Spatial View

- **Category:** Space-specific
- **Status:** VERIFIED
- **Purpose:** Show listener, sound-object angle/distance, and selected output layout
  in synchronization with the playhead.
- **Behavior:** view-only; no live motion recording or direct object dragging.
- **Visual decision:** the earlier red motion trail was removed and the object radius
  was reduced from 18 to 9 Canvas pixels to improve clarity and reduce visual weight.
- **Platform-independent requirement:** display the same Direction/Distance state;
  exact Canvas pixels are not portable product data.

## SCL-F010 - Stereo Spatial WAV

- **Category:** Space-specific
- **Status:** VERIFIED for downloaded file specification; NEEDS LISTENING TEST
- **Purpose:** Produce a two-channel headphone/general-listening deliverable.
- **Processing:** deterministic stereo pan, Distance tone/level shaping, and
  diffuse delay network. Stereo source is downmixed to mono before spatial render.
- **Output:** 2-channel, 48 kHz / 24-bit PCM RIFF WAV at input duration.
- **Limitation:** not a replacement for discrete Quad/Octo playback.

## SCL-F011 - Quad Spatial WAV

- **Category:** Space-specific
- **Status:** VERIFIED for downloaded file specification; physical test pending
- **Purpose:** Produce four discrete corner-speaker channels.
- **Channel order:** 1 front-left, 2 front-right, 3 rear-left, 4 rear-right.
- **Processing:** positive-cosine speaker weights normalized by root-sum-square,
  Distance processing, and per-channel diffuse delay state.
- **Output:** 4-channel, 48 kHz / 24-bit PCM RIFF WAV.

## SCL-F012 - Octophonic Spatial WAV

- **Category:** Space-specific
- **Status:** VERIFIED for downloaded file specification; physical test pending
- **Purpose:** Produce eight discrete channels in the project's 22.5-degree
  octophonic-square orientation.
- **Channel order:** clockwise 1..8; exact angles are in `DSP_BEHAVIOR.md`.
- **Output:** 8-channel, 48 kHz / 24-bit PCM RIFF WAV.

## SCL-F013 - Waveform And Playhead

- **Category:** Common
- **Status:** VERIFIED
- **Purpose:** Provide timing reference without competing with the curve editor.
- **Processing:** 1800 RMS buckets across at most two input channels, globally
  normalized for display only. This is not an absolute amplitude meter.
- **Behavior:** waveform, curve playhead, readouts, and Spatial View share the same
  normalized transport time.

## SCL-F014 - Clear And Reset

- **Category:** Common
- **Status:** VERIFIED
- **Purpose:** Restore a useful neutral curve state.
- **Clear Current:** resets only the active curve without confirmation.
- **Reset All:** confirmation dialog; resets both curves and position to zero;
  Cancel, Escape, and backdrop dismiss without resetting.
- **Limitation:** no undo/redo.

## SCL-F015 - Bottom Playback Bar And Output Meter

- **Category:** Common
- **Status:** VERIFIED in local Chrome with generated mono, stereo MP3, and hot stereo fixtures
- **Purpose:** Keep transport, position, time, and final headphone-preview level in
  one stable location without duplicating controls in the header.
- **Behavior:** Play/Pause and Stop retain SCL-F003 semantics; OUTPUT TIME seeks the
  source and synchronized visual state; L/R RMS, peak, peak hold, and latched CLIP
  read the final stereo Preview signal without changing it.
- **Measurement:** two-channel `AnalyserNode` tap after the Preview master gain;
  CLIP threshold is `0.999`; CLIP remains latched until clicked.
- **Scope:** the meter represents browser headphone Preview only. It does not meter
  the separately calculated Stereo/Quad/Octo WAV renderer.

## Explicitly Outside V1

Elevation, X/Y curves, dedicated CW/CCW controls, rotation-speed parameter,
Orbit/Spiral parameters, arbitrary speaker layout, Ambisonics, multitrack,
Live Motion recording, public LPF/reverb controls, Stereo Width, preset/state,
undo/redo, and calibrated room correction are not implemented.

## SCL-IDENTITY-001 - Hub Identity

IMPLEMENTED: Hub v0.10 Space header/favicon and palette.
See `IDENTITY_PILOT.md`. Publication authorized 2026-10-04.

## 2026-10-06 — Band-limited Render preparation (local, unpublished)

Decoded PCM is converted to 48 kHz with a 96-tap Blackman-windowed sinc before the unchanged spatial DSP. Already-48 kHz input bypasses conversion. Mono/stereo count is retained; output length is round(sourceFrames * 48000 / sourceRate). No parameter, speaker order, Preview, fade or gain changes.

Browser preparation/encoding tests: 30 passed, including four rates, mono/stereo input and stereo/quad/octo WAV headers and duration. 30 kHz rejection: 88.2→48 kHz -90.17 dB; 96→48 kHz -98.35 dB. Previously -3.12 dB and 0 dB respectively in the tested in-app browser. Test: tests/browser-render-resampling.html; converter checks: tests/render-resampling.mjs. These are synthetic numerical checks, not physical-speaker/listening, long-file or cross-browser certification.

## 2026-10-06 — Stereo Render input preservation (local candidate)

User authorized eliminating stereo mono-sum loss and avoiding severe cancellation. Two-channel export now has a separate linked-stereo branch; mono and 4/8ch code paths are unchanged. Each source has independent low-pass and two-channel diffuse state. Each contributes at gain 0.5 before the existing distance mapping and output ceiling. The mono-sum equations above describe the historical dc7e78e stereo-input path only.

Let theta be Direction radians and w=1-0.32d. halfSpan=max(0.5,abs(cos(theta))*sqrt(0.5)*w); center=clamp(sin(theta)*sqrt(0.5)*w,-1+halfSpan,1-halfSpan). Left/right source pans are center-halfSpan and center+halfSpan, followed by the existing equal-power cosine/sine gains. The gap floor and fixed source order intentionally prevent the direct two-by-two mix matrix from becoming singular at side positions. This is a stereo projection with limited lateral concentration, NOT literal rear source swapping or HRTF parity. The floor is an engineering candidate, not a listening-approved parameter. No artificial decorrelation, phase inversion, or input-dependent normalization is introduced.

QA: 864 fixed-angle 48k/24-bit WAV cases (0/90/180-degree source phase, 72 angles, bypass on/off, Distance 0/1). No complete loss, and tested rotation RMS span <3dB (anti-phase worst 2.784dB). Mono stereo/quad/octo and stereo quad/octo: 10 byte-identical cases against dc7e78e. L-only/R-only survive; hot rotating input stays within 0.98 ceiling. These narrow tone fixtures do not certify arbitrary music, frequency-dependent cancellation, physical speakers, or moving-curve listening. Browser anti-phase file loading, Play and render completion passed with no warning/error logs; download-event timed out, so actual disk persistence/reopen is NOT verified this turn. Resampling regression passed.

Evidence and repeatable QA are in the family workspace: SPACE_STEREO_SAFETY_CHANGE.md, qa/space-stereo-safety.mjs, evidence/space-stereo-safety.json. No commit/deployment yet. Multichannel shared diffuse state remains a separate pending investigation.

## 2026-10-06 — Correct multichannel stereo room clock

At baseline 002982d, Quad/Octo shared per-output diffuse tanks between input L/R; addPointSource advanced the same indices twice per stereo frame. An impulse at sample 960 with only one populated input produced its first diffuse reflection at 21.5ms instead of the mono 43ms. This was reproduced for both L-only and R-only in Quad and Octo.

Allocate independent per-source/per-output tanks; each now advances once per audio frame. Delay lengths 43/79ms, feedback coefficients, direct panning, speaker order, distance curves, WAV ceiling/fades/duration and Preview remain unchanged. Stereo multichannel room timing and texture intentionally change; mono and all 2ch outputs are preserved. Stereo diffuse memory doubles versus the old shared-bank implementation: at48k, Octo adds about183KiB of Float32 delay storage. No tail extension.

Node tests/multichannel-room-clock.mjs and browser tests/browser-room-clock.html pass all four cases at43ms, with mono versus correctly aligned one-sided stereo WAV PCM difference zero. QA regression preserves22 unaffected WAV cases byte-for-byte; two-source superposition matches within one24-bit LSB. Existing36 stereo motion cases and resampling regression pass. Browser decoded4/8ch and0.5s correctly. These are synthetic engine/runtime checks, not listening or physical-speaker certification.

## 2026-10-06 — Responsive export worker (local, not deployed)

App export now uses render-client.js and a disposable module render-worker.js; existing synchronous renderSpatialWav remains the DSP reference. Source channels are cloned (Preview is not detached), output WAV transfers back. Source, curve points, format and bypass are snapshotted at start. Cancel Render aborts rate preparation or terminates the worker, suppresses download, and restores controls. Errors also restore controls. Worker execution is not a memory reduction or low-end certification.

Browser tests/browser-worker.html: six format/bypass cases match synchronous WAV bytes, cancellation/recovery pass, 60s Octo completes with51 timer ticks rather than blocking main thread for about1s. Actual app180s stereo/8ch cancellation reaches cancelled with controls restored, no console errors. tests/render-preparation-cancel.mjs verifies mid-conversion and pre-abort. New worker download persistence/reopen and repeated memory recovery remain pending; musical listening not performed. Family workboard SPACE_WORKER_CHANGE.md holds baseline profiles and evidence.
