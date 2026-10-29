# Space Preview startup and motion — 2026-10-29

Status: IMPLEMENTED / USER-APPROVED FOR COMMIT AND DEPLOYMENT on2026-10-29. Non-listening verification is limited to the stated Chromium environments. Publication confirmation is recorded separately; browser/engine-wide or listening acceptance is not claimed.

## Approved scope and baseline

User requested cause-first separation of the new musical source, decoding/buffering, application DSP/control and browser spatial rendering, then bounded Space first-play and rapid-pan improvements. Baseline: e2849f1858a38e83d6a6322c4533663717c4e68a. Preserve existing dirty AGENTS.md. Other Labs and Native implementation are outside scope.

## Confirmed diagnosis

- Generated native OscillatorNode, generated AudioBuffer and the same PCM decoded from a float WAV all reproduce the initial mismatch after HRTF. Removing HRTF removes the approximately5dB startup transfer difference; bypassed Distance and disabled wet room do not introduce it. This excludes MP3 decoding as a necessary cause in these fixtures, not every possible device/input problem.
- Chromium's HRTF implementation copies input through while its asynchronously loaded database is absent. Offline rendering explicitly waits for that database. A shared loader is keyed by sample rate. Official source links below support this mechanism; installed-browser captures establish the actual observed behavior.
- Direct XYZ exponential interpolation between opposite directions crosses close to the listener origin. A deterministic identical target/time comparison with a clean997Hz input shows extra high-frequency transition energy. Angular smoothing reduces it, but HRTF transition energy remains even with continuously scheduled circular movement. This is not a claim that every HRTF modulation component is a defect or that all reported audible grit is resolved.
- The approved15s stereo musical MP3 changes source spectrum, attack and channel correlation compared with the former45s mono noise example. Those can expose an existing problem. Timing of the source replacement alone does not prove a new decoding/buffer defect. Earlier2026-10-21 HRTF observations also predate MP3 adoption; those historical reports are context, not current test passes.

## Implemented behavior

1. `prepareHrtf(context)` retains a disconnected HRTF panner per live context and awaits a256-frame OfflineAudioContext HRTF probe at the same sample rate. Its impulse never enters the live graph, is not source PCM, and is never routed to a physical output. This waits for completion rather than sleeping for a fixed200ms. Probe promise/data reference are reused in the same context. Failure is retryable.
2. Play still uses the existing request token. Stop, seek, file replacement or a newer Play invalidate an older pending request before it can create/start a source. Preparation failure reports an error; successful retry restores the source label only if that specific preparation error is still displayed. A different input error is retained.
3. Preview position smoothing now applies the existing25ms time constant to accumulated angle and positive radius, then converts to XYZ. Shortest-arc rewriting is not used: normalized Direction, its full±1800deg meaning and stereo±45deg spread are retained. Adaptive vector sampling limits successive angular steps to3deg over a100ms automation horizon. The100ms is a scheduled control horizon, not an added source delay or fade. Current automation is held before replacement.
4. Static positions, HRTF model, Distance/reverb processing, channel routing, master gain,10ms boundaries, retained-pause graph, curve smoothstep mapping, source time axis and existing render path are unchanged. Transient position trajectory intentionally changes from a chord to an arc; perceived equivalence is not certified without listening.
5. Sources, input validation, metering, WAV preparation/encoding, Stereo/Quad/Octo layout and48kHz/24bit policy are untouched. Preview HRTF and analytic WAV spatial rendering remain distinct existing paths.

## Evidence

Local evidence folder:
`/Users/hyunsukjun/Documents/ChatGPT/4.프로그램.완료/work/CurveLabWebV1/qa/space-cause-20261029`

-48 staged native-graph captures and48 readiness comparison captures: Chrome/Brave Chromium156.0.8078.48; readiness at44.1/48kHz; native oscillator, memory PCM and decoded WAV.
-80 actual-app before/after captures with observer-only hooks and a silent capture destination: mono tone, stereo tone and shipped MP3; first/repeat/rapid motion, plus Distance+Reverb fixture. All captures finite, no uncaught page errors. Same-source aligned initial300ms in all12 after first/repeat pairs match exactly. Some app-clock captures require up to256frames of source alignment; this does not certify physical playback/display latency.
-Identical hard-target schedule,997Hz/.25 input: >6kHz relative energy changes about−39.31→−43.52dB at44.1k and−39.90→−44.02dB at48k. Both tested browsers agree. In the actual smoothstep app fixture the improvement is smaller, approximately0.55–1.21dB. This is a numerical transition-energy measure, not a listening approval or complete noise elimination.
-6 lifecycle scenarios pass: two cancellation-during-preparation scenarios and four real-file before/after lifecycles. Include forced preparation failure/retry, pause with suspended clock, retained-source resume, playing seek, natural end/restart, point edit, and12 real WAV downloads across2/4/8ch.
-Chrome before/after WAV bytes match for all3 layouts. Brave bytes differ by near-uniform gain about0.026–0.040dB across fresh contexts; fitted correlation>0.999999999999 and residual RMS<4.9e−8. This is consistent with the previously isolated browser AudioBuffer readback effect; byte identity is explicitly not a Brave pass. Render/import/PCM-reader source bytes remain unchanged.
-A2s/48k input decodes as88199frames at44.1k in these browser contexts, then renders95999frames at48k, equally before/after. Initial QA assumed96000 and failed in both variants. The corrected test follows the existing actual-input/resampling contract. Product length code was not changed.
-12 focused module/syntax commands pass, including full-range radial safety,25ms response, readiness reuse/retry, input admission, retired source ownership, gestures, keyboard routing, render resampling and channel/timeline fixtures.

## Remaining limits and next gate

- HRTF rapid-transition grit is reduced, not closed. Browser internal interaural delay/filter transitions remain. No HRTF replacement, new low-pass, additional limiter, slower80ms motion or fixed200ms preroll is adopted.
- Direction targets still originate from animation-frame updates. Events narrower than that cadence can be missed; moving target evaluation to the audio clock is a separate open issue. A100ms vector horizon does not fix missing curve samples.
- Preview headroom/over-level source clipping remains open and separate. This change does not repair clipped source PCM.
- Offline preparation/source-aligned captures do not prove physical-device synchronization, real-time CPU headroom, Safari/Firefox/Windows behavior, or listening quality. Chrome and Brave here use the same Chromium version.
- User approved commit/deployment on2026-10-29, followed by saving and waiting. Publication verification is separate. Residual HRTF analysis must wait for the next instruction; no product-complete judgment.

## Standalone asset

Keep the concepts: explicit spatial-engine readiness; no source consumption before readiness; cancellable request ownership; positive-radius angular motion; independent startup/motion/headroom fixtures. Do not port the Chromium-specific OfflineAudioContext/shared-cache mechanism as a Native design requirement. Native readiness must use that engine's own completion/lifecycle contract. Preserve musical angle/radius/time/channel definitions and separate numerical evidence from listening.

## Primary implementation references

Retrieved2026-10-29; main-branch sources are explanatory, not an exact binary provenance claim:
- https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/platform/audio/hrtf_panner.cc
- https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/modules/webaudio/panner_handler.cc
- https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/platform/audio/hrtf_database_loader.cc
