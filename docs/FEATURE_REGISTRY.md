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

## Keyboard transport availability (2026-10-07)

Spacebar dispatches at most one transport action per physical press. Held-key repeats are consumed, and disabled Play or an absent source blocks dispatch. Input, select, textarea and editable-text targets retain native keydown/keyup behavior. Existing Play/Stop or Play/Pause semantics and DSP are unchanged. While Reset All is open, both Space events are left to the dialog buttons: Cancel and confirmation remain keyboard-operable without toggling background transport. See `tests/transport-keyboard.test.mjs` for event-routing regression checks; these isolate command dispatch from DSP.


## AIFF input compatibility (2026-10-11)

See [AIFF import contract](AIFF_IMPORT.md): local PCM AIFF 16/24-bit mono/stereo
normalization into PCM WAV before the established decoder. Existing DSP,
resampling and Lab-specific channel policies are preserved. Browser and memory
verification limits are recorded there.


## Waveform above curves (2026-10-13)

The existing output-time/source-guide waveform now appears above the curve editing
canvas, following the shared Curve Lab reading order. Its source-guide meaning,
click/drag/keyboard seek, parameter IDs, normalized curves and DSP remain unchanged.
This is a layout change only; Audio's output deletion/fades are not added here.


## Common bottom transport — 2026-10-13
COMMON CANDIDATE, implemented locally. Audio reference adopted: Return to start,
Play, Pause, output-position slider, time, continuous green/yellow/red stereo meter,
CLIP. Neutral 16px icons are centered inside 38x32px buttons; 34px slider hit area.
Return to start seeks to zero while preserving playing/paused state. Pause retains
position; Play resumes; Space toggles Play/Pause outside editable controls.
Internal reset stops for import/export/settings remain distinct and unchanged.
No DSP algorithm or output format changes. Resume uses this Lab's existing engine
initialization; continuous-sample-identical resumption is not promised.
The existing waveform guides remain in their existing locations.
OUT and numeric meter values are visually removed (values remain accessible).
Meter color fields are clipped at the level, not stretched; retain analysis,
ballistics, peak hold and CLIP semantics. Shared CSS/module are vendored locally,
with per-Lab adapters and no external runtime dependency.
Oscillator retains its existing source-duration seek cap for convolution tails.
Verification covers syntax, keyboard contracts and browser layout; file-based
Labs also exercised silent-WAV pause/resume. Audible listening, Safari/Windows,
long-file performance and Oscillator mode-specific listening remain separate QA.


## 2026-10-14 — Independent FDN Reverb (local candidate)

See [implementation and verification contract](REVERB_IMPLEMENTATION_2026-10-14.md). Adds Reverb enable, Amount35%, nominal Decay1.2s (0.3–4s), optional Distance-linked send (default on), and positive Distance On control. One shared eight-line FDN replaces the app's previous room paths; no duplicate room send. Direction/Distance curves and48k/24-bit/channel layouts remain. Reset All restores the new settings. Audio voicing is NEEDS LISTENING TEST; full Preview/Render spatial parity is not claimed.


## 2026-10-14 — Reverb becomes an independent curve

Supersedes the earlier same-day scalar/link UI: [Reverb curve contract](REVERB_CURVE_2026-10-14.md). Direction → Distance → Reverb edit selectors each have a separate power button; values survive Off. Reverb uses normalized0–100% smoothstep send curve, default35%; fixed Decay appears only for Reverb. No visible checkbox/link controls or app Distance-to-room coupling. Preview/export both read the curve. Local verified candidate, not deployed or listening-approved.


## 2026-10-14 — Family-style module toggles replace separate power controls

User explicitly rejected separate power buttons. Direction/Distance/Reverb buttons now directly toggle their effect; enabling selects that curve, disabling selects the first remaining enabled module. When all are off, the readout says All Off and pointer editing/Clear Current are disabled. Stored curve points remain intact. Button aria-pressed and colored border represent enabled state; underline represents selected editor. Reset All restores module defaults. This supersedes earlier same-day separate-power descriptions.

Verified in the browser: all three off, Reverb alone on, add a point and toggle off/on retains three points; no console errors. HTML/CSS/event changes only; FDN and export DSP unchanged. Decay remains static: a future Amount/Decay sub-curve selector is a proposal only. No commit/deployment this turn.


## 2026-10-14 — Direction-only startup default

User requested Direction enabled and selected on launch, Distance and Reverb disabled. Reset All restores this same state. Distance bypass is true initially; room enabled is false for Preview and Render. Stored defaults remain Distance0, Reverb Amount35%, Decay1.2s and are applied when enabled. No algorithm or curve-range change.


## 2026-10-14 — Readable default noise pulses

User requested a better default waveform and release. The prior45s demo repeated45.833ms bursts separated by20.833ms (about15Hz), producing a dense striped overview. Keep45s/mono/seed45066/gain0.32, but use1.2s bursts +1.3s gaps, attack80ms/decay340ms/sustain0.22/release600ms. Repeating six-event amplitude accents0.72/0.9/0.62/1/0.8/0.56 give18 distinct pulses. This intentionally changes only generated demo cadence/envelope, not imported audio or spatial DSP. The waveform remains derived from real PCM; reduce its outline opacity0.62→0.28 to avoid harsh edges.

Browser visual inspection, default playback/pause and download pass with no console errors. Actual WAV:2ch/48kHz/24-bit/exact45s. Direction-only startup preserved. Syntax/diff checks pass; musical listening is not certified.


## 2026-10-14 — Spatial labels and faster demo (local)

User identified optical imbalance at stereo R and Octo3/4. Speaker labels now face inward on both sides, using measured glyph width, a12px anchor offset, middle baseline and frame-safe text bounds. Actual speaker dot positions, angles, channel order and audio routing are unchanged. Stereo/Quad/Octo were visually inspected in the1422x800 browser viewport.

Default demo repetition period is halved2.5s→1.25s: burst1.2→0.6s, gap1.3→0.65s; attack/decay/release also halved to40/170/300ms to preserve envelope proportions. Duration45s, gain, seed and accent pattern remain;36 pulses instead of18. Playback/pause and browser console checked; syntax/diff checks pass. No commit/deployment requested for this turn; local changes only.


## 2026-10-14 — Family file information

Approved circular dotted-i disclosure immediately left of Open Audio. Default format guidance moves into this optional panel; privacy and actual error/status notices remain. Space operates disclosure without audio transport; Escape/outside click dismiss. Output guidance: Source duration · 2 / 4 / 8 channels · 48 kHz / 24-bit WAV. Input limits reflect current implementation, not a device-memory guarantee. No DSP, admission, export, IDs or defaults changed.


## 2026-10-14 — Family parameter help

Static parameter descriptions are available on the relevant buttons using the Audio help design; current values, axes and activation feedback remain visible. See `docs/PARAMETER_HELP.md` (or `PARAMETER_HELP.md` in this directory). No DSP or curve mapping changes.


## 2026-10-14 — Open Audio keyboard access
파일 입력을 display:none 대신 시각적으로만 숨겨 Tab과 Enter/Space로 기본 파일 선택기에 접근하도록 수정. 포커스는 기존 fileButton:focus-within 윤곽선으로 표시한다. 파일 디코딩·처리 계약은 변경하지 않는다.


## 2026-10-14 — Reset modal focus
Reset 확인창의 Tab/Shift+Tab은 Cancel과 Reset All 사이에서 순환한다. Escape 취소와 닫은 뒤 Reset All 포커스 복귀는 유지한다. 확인창 뒤의 버튼을 키보드로 우발 작동하지 않도록 보완하며 리셋 대상과 음향 처리는 변경하지 않는다.

## 2026-10-15 — Source-tone waveform (local review, not released)

- Follow the Audio/Timbre source-tone palette: blue → teal → gold → peach indicates low-to-high spectral centroid of the original source. It does not represent processed output, level, clipping, or sound quality.
- Signed min/max summary up to 16,000 buckets preserves transients; display gain is normalized without changing samples. HiDPI polygon rendering replaces the coarse waveform. Static waveform raster is cached while cursor/selection overlays update independently.
- Worker analysis samples at most 1,024 Hann/FFT windows per channel (1,024 samples/window, max two channels). File replacement cancels stale work; analysis failure falls back to blue. Long files are sampled and brief events may be missed; this is a visual guide, not a spectrogram.
- Existing DSP, playback/export, normalized curves, timing and channel routing remain unchanged.
- Local source-color tests and syntax/diff checks passed. Browser import and play/pause checked. Brave at 900×700 with actual 125% and 150% zoom checked; vertical scrolling is retained on short screens. No subjective listening, Windows, or native confirmation-keyboard claim.
- Await user visual review before commit/deployment.

Space: mono/stereo source lanes retained with a shared display peak. Earlier RMS silhouette replaced by signed peak envelope for clearer transients. Spatial View and spatial processing are unchanged; waveform remains source-only. Mono default and stereo file import/play/pause checked.
