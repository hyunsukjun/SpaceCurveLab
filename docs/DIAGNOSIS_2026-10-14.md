# Space Curve Lab — parameter and engine diagnosis

Date: 2026-10-14. Baseline: 6136336. Diagnostic only; no DSP change or release.

## Confirmed current behavior

- Direction: cumulative -1800…1800 degrees, smoothstep curve; preview uses HRTF, exports use stereo projection or speaker weights.
- Distance: relative Near/Far 0…1, jointly controls direct gain, low-pass and room send. It is not calibrated metres. Bypass retains Direction.
- Stereo input stays as two sources. Preview and multichannel export offset sources by -45/+45 degrees; stereo export preserves source order with a minimum pan separation to avoid singular direct mixing. Do not restore mono summation or remove that safety floor casually.
- Preview is headphone stereo irrespective of export format. This deliberate distinction must remain explicit.

## Prioritized findings

1. **Distance filter consistency:** `distance-engine.js` uses a Biquad low-pass with Q 0.45; `offline-render.js:shapeDistanceTone` uses a one-pole filter. Both display the same 19000–9500 Hz mapping but do not have the same response. Near also filters unless Distance Bypass is enabled. First measure isolated responses, then choose a shared filter contract before changing sound.
2. **Motion scheduling:** `app.js:tick` calls `updatePreview` from requestAnimationFrame. Position and distance audio parameters therefore depend on display scheduling. Background-tab throttling or a busy UI could hold outdated values while audio continues. This is a code-level risk, not a reproduced browser failure in this review. Test background/foreground motion before choosing audio-clock scheduling.
3. **Room parity:** preview uses a seeded 1.15-second convolution impulse, output uses short feedback delay networks. They are different room models, not merely different playback routing. Keep existing sound as baseline; plan isolated comparisons rather than silently adding a new reverb control.
4. **Level policy:** preview master is 0.9, with no explicit limiter; export uses format/source-dependent gains and whole-file attenuation only when peaks exceed 0.98. The meter does not predict exported loudness or peak. Test correlated hot stereo and far-distance cases before deciding headroom changes. No clipping failure claimed here.
5. **Tail policy:** both stop at input duration with boundary fades. Reverb after the source endpoint is omitted. This preserves current duration policy; any optional tail extension needs an explicit duration/export decision.

## Parameter / UX assessment

- Keep Direction and Distance as the two principal curves; avoid adding several room parameters before resolving engine consistency.
- ±5 turns serves rotation gestures but makes fine angle editing harder; examine zoom/readout precision separately, retaining stored ranges.
- Explain Distance as a combined perceptual control, not physical distance; keep headphone-preview versus speaker-export labeling visible.
- Current stereo export intentionally cannot reproduce HRTF front/back motion. This is a product-mode distinction, not something to fix by forcing all routing to match.

## Verification performed

All existing suites below passed under Node on 2026-10-14:

- tests/render-resampling.mjs: rate conversion, duration frame counts, stereo relationship, frequency rejection and abort checks.
- tests/multichannel-room-clock.mjs: four Quad/Octo single-sided stereo cases, 43 ms first reflection and unchanged aligned PCM.
- tests/stereo-motion.mjs: 36 synthetic rotating stereo cases, no near-silent 50 ms windows under its thresholds.
- tests/weight-reuse.mjs: 24 baseline WAV byte fixtures.
- tests/render-preparation-cancel.mjs: cancellation/pre-abort.

These do not certify musical listening, actual speakers, background-tab motion, Safari/Windows, or long-session memory. No new browser/listening test was performed in this diagnostic pass.

## Next bounded step

Measure preview/export distance-filter responses at Near/Mid/Far and representative sample rates. Retain routing, curves, room model, output format and stereo safety while defining the smallest justified consistency change. Background scheduling is the next independent technical verification. Listening-dependent room and distance-strength decisions remain deferred.
