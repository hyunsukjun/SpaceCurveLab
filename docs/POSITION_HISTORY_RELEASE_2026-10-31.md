# Space preview position history — release scope · 2026-10-31

- Integrate the validated position scheduler from graph creation,including initial play,seek-created graphs and retained resume.
- Keep normal target timestamps,polar/25ms response,spatial mappings,source/filter/room time and2/4/8ch48kHz24-bit WAV rendering.
- Product-root checks:11focused groups,18browser UI actions,24actual baseline/candidate WAV byte pairs,and2cancel/recovery/reopen scopes pass.
- This is non-listening numerical/runtime evidence. Public deployment confirmation is recorded after push in the QA release record;device/spatial listening and other HRTF noise remain separate.

## Implementation and validation

Runtime changes are src/preview-spatial.js and cache keys in src/app.js/index.html. The scheduler keeps only2owned position tables;no diagnostic proxies,global logs or resume arming hooks are included. Initial/immediate reset clears tables. tests/preview-spatial.mjs checks the updated boundary/reset contract while retaining response/radius/full-turn/preparation/fallback checks.

The applied4files are byte-identical to the previously validated product-form candidate. Its48same-source native comparisons(maxcoordinate0/PCM5.96e-8) and4loaded180s/case958transport cycles therefore remain scoped evidence;long tests are not silently counted as a new run. After application,11focused groups and actual product-root browser/download checks were rerun. Stereo/mono inputs,room on/off,andStereo/Quad/Octo outputs form24WAV byte pairs;all have48kHz,24-bit,192000frame headers. Brave final comparison uses the same browser context,matching input read and cancel histories. Raw unmatched comparisons are retained.

A release-test reopening filename mismatch was fixed to reopen the actual newly downloaded candidate recovery WAV. The earlier failure is retained as a test-path issue,not an audio-engine failure. Public verification must again use the actual recovered filename.

## Boundaries

No render DSP,channel order,curve value/time mapping or visual layout changes. No physical listening/device acceptance or guarantee for every browser/load/source. No Native code/stage promotion. Prior diagnostic documents and unrelated local AGENTS changes are preserved outside this scoped release.

Local evidence root: work/CurveLabWebV1/qa/space-position-history-release-20261031. Prior product-form evidence: work/CurveLabWebV1/qa/space-product-history-20261030. Public result/workflow/asset hashes and actual browser/WAV checks are recorded in the release QA report after deployment.
