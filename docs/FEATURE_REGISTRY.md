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
- **Behavior:** Play/Pause and Stop retain SCL-F003 semantics; Position seeks the
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
