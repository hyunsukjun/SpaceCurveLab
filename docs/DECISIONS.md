# Product Decisions And Fine-Tuning History

This log records decisions that materially shape the product. Dates before the
documentation baseline are reconstructed from Git history and the associated
product discussion. Unknown listening conditions are not inferred.

## SCL-D001 - Two Core Curves Only

- **Date:** 2026-09-01
- **Decision:** v1 exposes Direction and Distance only.
- **Reason:** keep spatial motion directly understandable through time and avoid
  turning the prototype into a DAW or general spatialization suite.
- **Excluded alternatives:** Elevation, X/Y, Orbit/Spiral parameters, explicit
  rotation speed, arbitrary layouts, Ambisonics, multitrack, and Live Motion.
- **Affects:** UI, state model, DSP, teaching scope, Standalone.
- **Status:** APPROVED.

## SCL-D002 - Cumulative Direction In Degrees

- **Date:** 2026-09-01
- **Decision:** Direction range is `-1800..+1800 deg`, centered at zero; positive
  means clockwise and negative counterclockwise.
- **Reason:** curve height represents accumulated turns while slope communicates
  rotation speed. Five rotations in each direction support long gestures without
  a separate speed/orbit control.
- **Alternative:** wrapped `0..360 deg` position, rejected for losing accumulated
  rotation meaning.
- **Status:** APPROVED; listening-based speed limits remain unknown.

## SCL-D003 - Simple Modular Distance DSP

- **Date:** 2026-09-01
- **Decision:** use stable Web Audio nodes for Preview: gain, gentle low-pass, and
  generated convolution room; keep internal parameters hidden.
- **Reason:** prioritize web-standard longevity, low dependency risk, and a
  replaceable prototype module before more advanced room simulation.
- **Alternative:** AudioWorklet/FDN, measured IR assets, full acoustic model.
- **Status:** APPROVED for prototype, replaceable later.

## SCL-D004 - Mono Point Source And Stereo Linked Pair

- **Date:** 2026-09-01
- **Decision:** mono is one point source; stereo uses a Direction-centered linked
  pair offset by minus/plus 45 degrees. Stereo Width is not exposed.
- **Reason:** preserve stereo identity while maintaining one understandable
  Direction curve.
- **Status:** APPROVED; exact spread requires future listening confirmation.

## SCL-D005 - Output Roles

- **Date:** 2026-09-01
- **Decision:** Stereo 2ch is a headphone/general-listening spatial deliverable;
  Quad 4ch and Octo 8ch are discrete speaker-map renders.
- **Reason:** give headphone-only artwork a useful output while preserving real
  channel distribution for installations and fixed-media speaker playback.
- **Status:** APPROVED.

## SCL-D006 - Speaker Layout And Quad Labels

- **Date:** 2026-09-01; revised 2026-09-26
- **Decision:** Octo uses the 22.5-degree offset clockwise channel order 1..8.
  Quad initially displayed octophonic corner numbers 8/2/6/4, then changed to
  direct WAV channel labels 1/2/3/4 at FL/FR/RL/RR.
- **Reason for revision:** direct output-channel labels are less confusing while
  retaining the intended corner geometry.
- **Affects:** speaker visualization, WAV channel interpretation, documentation.
- **Status:** APPROVED; physical system verification pending.

## SCL-D007 - Distance Controls Room Automatically

- **Date:** 2026-09-27
- **Decision:** remove the separate Room Dry/Wet control. Distance automatically
  controls room amount; Near has no room send and Far has maximum room amount.
- **Reason:** Distance should remain one musically readable macro. Users who do
  not want room processing can leave Distance at Near or use Distance Bypass.
- **Alternative:** separate Room Mix/Dry-Wet UI, implemented briefly then removed.
- **Status:** APPROVED.

## SCL-D008 - Distance Room Mapping Fine-Tuning

- **Date:** 2026-09-27
- **History:**
  - automatic equal-power crossfade limited to maximum amount `0.65`
  - maximum increased from `0.65` to `1.0` because Far change was insufficient
  - equal-power dry/wet crossfade replaced by `dry=1`, `wet=distance`
- **Reason:** the equal-power response felt too concentrated near Far; changes in
  the first half of the curve were hard to hear. The current linear send preserves
  direct sound and makes room growth more evenly legible.
- **Result:** current mapping is linear room send `0..1`; Preview applies gain 0.4
  after this shared amount. Render uses the full amount in its internal network.
- **Listening environment:** UNKNOWN.
- **Status:** APPROVED directionally; NEEDS MORE TESTING across material/output systems.

## SCL-D009 - Deterministic Generated Assets

- **Date:** 2026-09-02 onward
- **Decision:** generate the default noise sample and Preview impulse in code with
  fixed seeds; do not add external audio assets.
- **Reason:** copyright independence, repeatability, small static deployment, and
  long-term availability.
- **Status:** APPROVED.

## SCL-D010 - Safe Render Boundaries And Peak Ceiling

- **Date:** 2026-09-26
- **Decision:** apply 8 ms WAV boundary fades and attenuate only when peak exceeds
  0.98; add short Preview start/end/stop fades.
- **Reason:** reduce clicks and clipping without normalizing quieter material up.
- **Alternative:** limiter/normalizer, not added to keep the path simple.
- **Status:** IMPLEMENTED; hot-file listening tests remain desirable.

## SCL-D011 - Curve Editing Tools

- **Date:** 2026-09-26
- **Decision:** Pen is default; Eraser deletes only an existing interior point;
  empty Eraser clicks do nothing; endpoints are protected; Command/Ctrl click is
  temporary erase.
- **Reason:** align Curve Lab interaction while preventing accidental curve loss.
- **Status:** VERIFIED on macOS Command-click; Windows Ctrl-click pending.

## SCL-D012 - Curve Lab Design System And Violet Identity

- **Date:** 2026-09-28
- **Decision:** apply the shared deep navy/charcoal system and Violet `#A78BFA`
  identity while retaining Cyan Direction and Red Distance semantics.
- **Reason:** establish series coherence without erasing module-specific meaning.
- **Status:** VERIFIED in local and deployed browser views.

## SCL-D013 - Fixed 48 kHz / 24-bit WAV Output

- **Date:** 2026-09-29
- **Decision:** accept browser-decodable mono/stereo input at its decoded rate, but
  prepare all Stereo/Quad/Octo Render input at 48 kHz and encode 24-bit PCM WAV.
- **Reason:** provide a consistent production format for DAWs, video, fixed-media,
  and multichannel installation work while retaining low-level precision and lower
  quantization error during later processing. The 0 dBFS ceiling is unchanged.
- **Implementation:** OfflineAudioContext performs browser-standard resampling;
  output frame count preserves duration and the WAV encoder writes signed 24-bit
  little-endian samples.
- **Alternatives:** preserve input sample rate and 16-bit output; rejected as less
  predictable for the intended production workflow. A custom/native high-quality
  resampler is deferred to Standalone.
- **Affects:** Render, WAV export, file size, performance, documentation, Standalone.
- **Status:** APPROVED; browser resampler comparison and DAW multichannel import
  testing remain required.

## SCL-D014 - Shared Bottom Playback Bar

- **Date:** 2026-09-30
- **Decision:** move Play/Pause, Stop, the sole time display, Position, and final
  stereo Preview metering into one bottom bar based on Audio Curve Lab `e0815b8`.
- **Reason:** keep transport state visible beside timeline position and output
  evidence while removing duplicated header controls across the Curve Lab family.
- **Space adaptation:** Position rebuilds Space's `AudioBufferSourceNode` graph at
  the selected offset; the meter observes the final HRTF Preview master, not the
  independently rendered Quad/Octo channels.
- **Affects:** transport UI, seek interaction, Preview measurement, Standalone.
- **Status:** VERIFIED for browser interaction, metering, CLIP reset, and responsive layout;
  subjective listening remains ongoing.

## SCL-D015 - Simplify The Spatial Sound Object

- **Date:** 2026-09-30
- **Previous behavior:** a red sound object with radius 18 Canvas pixels and a
  34-point fading red motion trail covering the recent normalized timeline.
- **Decision:** reduce the object radius to 9 Canvas pixels and remove the trail.
- **Reason:** the object was visually too large and the trail read as red smoke,
  distracting from the current Direction/Distance position.
- **Sound impact:** none; this changes only Canvas presentation and removes repeated
  trail drawing work.
- **Standalone requirement:** preserve the clear current-position indicator; the
  exact pixel radius is web-specific and the removed trail is not product behavior.
- **Status:** IMPLEMENTED for the `20260930-02` release.

## SCL-D016 - Lightweight Web Skin

- **Date:** 2026-10-02
- **Decision:** remove full-screen blurred animated backgrounds, decorative panel
  shadows, translucent stacked work surfaces, and non-functional control transitions.
- **Reason:** retain the Curve Lab visual hierarchy while reducing avoidable browser
  compositing and paint decoration, especially on less capable systems.
- **Protected behavior:** layout dimensions, responsive breakpoints, controls,
  Canvas content, semantic colors, audio state, DSP, Preview, and Render are unchanged.
- **Result:** deep navy/charcoal surfaces become opaque; Violet identity and
  Direction/Distance/meter colors remain intact.
- **Verification boundary:** visual and functional browser checks can confirm parity,
  but no performance improvement is claimed without measurements on target hardware.
- **Status:** IMPLEMENTED and locally verified; publication is tracked in Git history.

## SCL-D019 - Source Waveform As OUTPUT TIME

- **Date:** 2026-10-05
- **Decision:** move the existing waveform below the curve, use it for pointer and keyboard seeking, and remove the redundant Position slider. Retain the right-side Spatial View.
- **Reason:** one visible time surface links the source event to both curves without adding another waveform or editing curve points accidentally.
- **Reference:** Timbre `5530711`: bright 1.5px current line, 5px half-width / 7px triangles; hover uses the same color with a 3/4 dashed pattern, hidden during dragging and outside the plot.
- **Source semantics:** mono has one lane, stereo has L/R lanes, independently of WAV output channels. RMS buckets use one common visual normalization across both lanes, preserving their relative level. This is an input overview, not a spatial render or peak meter.
- **Audio consequence:** seeking retains the existing source-graph replacement/fade mechanism; it does not reconstruct the preceding reverb history. Preview remains headphone stereo; offline Stereo/Quad/Octo routing and duration remain unchanged.
- **Octo display correction:** a fixed 216px speaker radius can exceed the 180px half-width of the smallest backing canvas. Limit only the Octo display radius to `min(216, centerX - 30)` and use 14px labels. Preserve 22.5-degree angles, numbering, Quad/stereo display, and audio mapping.
- **Standalone contract:** shared normalized time, separate waveform/editor input ownership, explicit source-versus-output labels, and readable speaker labels are portable; source restart details are Web Audio-specific.
- **Status:** locally verified; commit and publication authorized on 2026-10-05. Release identity is tracked in Git history.

## Future Decision Records Required

- approved listening sweet spots for Direction and Distance
- acceptable Preview/Render perceptual difference
- whether 2ch render should preserve stereo input width instead of mono downmix
- output-tail policy and WAV multichannel metadata/channel masks
- native framework and audio engine choice
- versioned preset/state schema
- high-DPI Canvas policy for the remaining web implementation

## SCL-D017 - Hub v0.10 Identity Pilot

2026-10-04 · PROJECT-SPECIFIC. Canonical #A982FF and 3 orbit/3 point identity
replace #A78BFA and the generic waveform. Preserve semantic spatial colors and
processing. Implemented in `ef37f4d` and included in the subsequent public
release. See `IDENTITY_PILOT.md`.

## SCL-D018 - Laptop-First Responsive Workspace

- **Date:** 2026-10-05
- **Decision:** keep the existing Space workspace structure, fix the shared
  playback bar to the viewport bottom, reserve matching scroll space, and size
  the Waveform and Curve Canvas displays from viewport height with explicit
  Space-specific minimums.
- **Reason:** the previous `58vh` Curve minimum pushed Play/Stop, time, and meters
  below the first view at `1366x768` and `1280x800`, even though Spatial View
  already fit beside the curve.
- **Space adaptation:** preserve the square Spatial View and its speaker geometry;
  the Waveform yields height first, then the Curve stops shrinking at `250px` in
  side-by-side layouts. Single-column layouts retain a `300px` Curve minimum and
  expose Spatial View through vertical scrolling.
- **Protected behavior:** normalized curve data, pointer conversion, internal
  Canvas drawing resolution, DSP, Preview, speaker layouts, playback, and Render.
- **Status:** IMPLEMENTED and locally verified; publication is tracked in Git history.

## 2026-10-06 — Revise SCL-D013 resampler implementation

The fixed 48 kHz/24-bit policy is retained. SCL-D013's OfflineAudioContext resampling and deferral of a custom converter are superseded by 96-tap windowed-sinc preparation. The current browser left 30 kHz energy when downsampling; duration-only verification missed this. The context fallback now only allocates AudioBuffer storage and does not resample. Mono/stereo and the spatial renderer remain unchanged. Local implementation, unpublished; physical output/listening and long files remain unverified.

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

## 2026-10-06 — Worker release gate passed

Browser worker suite now repeats cancel/short rerender five times, each WAV byte-identical to synchronous reference; six format/bypass parity cases and source preservation pass.60s Octo finished in1084ms with54 UI timer ticks in this run. Brave normal Download WAV/native Save produced45s/8ch/48k/24-bit/2160000frames, SHA25682dbd1b4bf027090a096a9b34b75bfe9c0a42bc237a238b060e7433e0041d5d3. Actual file reopens as45s/8ch and Play/Stop works without console warnings/errors. Preview still uses first two channels; this is not physical8ch playback certification. This supersedes pending worker file persistence/reopen for this tested case. Memory recovery/low-end devices and musical listening remain unverified. Family evidence: space-worker-download.json, space-worker-final.txt, space-worker-download-reopened.png.

## Give editing and dialogs priority over global transport (2026-10-07)

COMMON CANDIDATE: transport shortcuts must respect the same availability as Play and must not consume form editing or modal button activation. Guard the current handlers without changing DSP or curve data. The old modal handling could start background playback (Audio/Space handler path; directly reproduced in Space) or suppress Cancel keyup (directly reproduced in Spectral). Both phases now defer to the open dialog.
