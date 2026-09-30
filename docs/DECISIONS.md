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

## Future Decision Records Required

- approved listening sweet spots for Direction and Distance
- acceptable Preview/Render perceptual difference
- whether 2ch render should preserve stereo input width instead of mono downmix
- output-tail policy and WAV multichannel metadata/channel masks
- native framework and audio engine choice
- versioned preset/state schema
- high-DPI Canvas policy for the remaining web implementation
