# Space Preview release anchor — 2026-10-29

Status: implemented and locally verified; user authorized commit and public release on 2026-10-29 after the pre-commit report. Deployment proof is recorded separately. Listening and product acceptance remain separate. Baseline: dd83ead626973bc83159e88e9a2d24bde7d78a9d. User authorized this bounded fix and a pre-commit report.

## Reproduced cause

The previous Pause and retiring-graph release used cancelAndHoldAtTime(now), then linearRampToValueAtTime(0, now + 10 ms). In the measured Chrome/Brave combination the new release on a plateau connected to an earlier automation event and caused a large initial drop. An independent constant source reproduced it without HRTF, decoding, file routing, reverb, or context suspension. This establishes an application automation boundary defect; it does not establish the cause of every audible click or a browser conformance bug.

## Change

src/preview-envelope.js owns the same linear attack/plateau/natural release schedule and a weak per-gain record. On Pause or a fading retired graph it evaluates the existing envelope at audio-clock now, cancels/holds automation, explicitly writes that value at now, then ramps to zero over at most 10 ms. An interrupted attack starts below 0.9. An existing natural/repeated release retains the earlier deadline; no gain revival, stacked fade or extended tail is introduced. The current scheduled envelope is used instead of trusting a possibly stale .value getter. The .9 steady Preview multiplier and 10 ms attack remain unchanged.

The same helper serves ordinary Pause and old-graph fading during seek/rewind. Ownership tokens, suspend polling, pause position, retained source/room/panner graph, fresh-start HRTF preparation, and existing source-duration tail policy remain. This is not an audio-clock redesign or a change to HRTF motion. Direction/Distance/Reverb curve values, interpolation, smoothing, channels and WAV algorithms are unchanged.

## Evidence

- 13 focused command suites plus changed-module syntax checks pass, including explicit anchor model, interrupted attack, repeated release, natural-end overlap, very short output, retained resume and independent seek graphs.
- Native OfflineAudioContext matrix: 36 candidate cases (Chrome/Brave x 44.1/48/96 kHz x six boundaries), plus 36 baseline controls. Chrome raw envelope max error <= 3.10e-8. Brave has a uniform readback amplitude difference also present in unchanged ordinary playback; after reporting/fitting that scalar, shape max error <= 4.14e-8. This is not Brave byte-identity certification. The initial raw-tolerance failure is retained in evidence.
- Actual app: 12 capture scenarios (4 baseline + 8 candidate), fixed/moving/Room-enabled and suspend-suppressed controls. Fixed-tone candidate release error <= 1.41e-5 versus baseline > 0.23; captured samples after the ramp are zero. The suspend-suppressed control confirms that the discontinuity correction occurs before device/context shutdown.
- Four actual MP3 lifecycle runs: before/after in Chrome/Brave. Pause freezes source position and retains exact source/room/panner identities; resume retains graph; three repeat cycles, rewind, old-source callback ownership and natural end pass.
- 12 actual WAV downloads: before/after Stereo/Quad/Octo, both browsers; channel count, 48 kHz, 24-bit and source duration match. Chrome all three byte pairs match. Brave pairs are not byte-identical; shape correlation >= 0.99999999999989 and fitted residual RMS <= 5.08e-8, with a small scalar readback difference. Do not silently mark those pairs byte-equal.

Evidence directory: /Users/hyunsukjun/Documents/ChatGPT/4.프로그램.완료/work/CurveLabWebV1/qa/space-envelope-anchor-20261029
Key files: native-envelope.json, native-envelope-initial-raw-readback.json, app-pause.json, app-pause-analysis.json, app-lifecycle.json, wav-comparison.json, regression.json, summary.json.

## Limits and next boundary

No listening, physical output-device continuity, Safari/Firefox/Windows, CPU headroom, or Native implementation acceptance is claimed. Residual rapid HRTF motion/control-rate noise and headroom are separate unresolved issues. User approved this bounded correction for commit and publication on 2026-10-29. This does not approve HRTF motion redesign or certify listening; release proof is separate.

## Standalone transfer

Portable rule: release begins from the gain at the current audio frame, not the old event time or a stale UI/parameter getter. Keep per-voice envelope ownership; cap release at an earlier existing end; preserve effect state on Pause; ignore retired callbacks. Native callbacks must use their frame clock and avoid Web Audio APIs/timers. Reuse the boundary scenarios as acceptance fixtures before adopting the rule in Native. This document and the shared transport asset are knowledge assets, not Native code or an execution approval.
