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


## 2026-10-04 - Hub v0.10 Identity Pilot

Commit `ef37f4d`; icon and product color only. JS syntax/hash preservation, SVG source hashes
and 3-orbit/3-point counts passed. Desktop 1294px and narrow 434px (document 419px)
checked. Default sample Play/Stop and clock reset observed in a separate tab.
Console error/warning list empty. No listening, multichannel physical output,
or new export validation claimed. Publication is verified with the following
laptop-workspace release.

## 2026-10-05 - Laptop-First Responsive Workspace

- **Version:** local working tree on top of `ef37f4d`; stylesheet cache target
  `20261005-laptop-ui-01`
- **Evidence:** `STATIC`, `BROWSER`, and downloaded-file header inspection
- **Browser:** Codex in-app Chromium for responsive and interaction checks; Brave
  for a physical download into the local Downloads folder
- **Responsive checks:** `1366x768`, `1280x800`, `1366x620`, `760x800`, and
  `1920x1080`. No page-level horizontal overflow was observed. At the two laptop
  sizes the Curve, Spatial View, fixed playback bar, time, Position, and meter
  were visible together. Low/narrow layouts could scroll the full Spatial View
  above the fixed bar.
- **Mode expansion:** not applicable; Direction and Distance do not reveal extra
  controls or change workspace height.
- **Curve checks:** point add, drag, delete, Pen restoration, and `2 -> 3 -> 2`
  point preservation across a `1366x768` to `1280x800` resize.
- **Audio source:** `/Users/hyunsukjun/Downloads/sample.mp3`, decoded as stereo,
  `9.10s`. Play advanced to `00:00.87`, L/R meters read `-18.7/-17.8 dB`, and Stop
  returned time and Position to zero.
- **WAV artifact:** `space-curve-lab-2ch-48k-24bit (3).wav`, generated from the
  default 45-second sample in Brave; RIFF PCM, stereo, 48 kHz, 24-bit,
  `12,960,044` bytes. The browser download event was not exposed to automation,
  so completion was confirmed from the UI status and newly timestamped file.
- **Console:** no errors or warnings observed in the in-app browser or Brave.
- **Not verified:** Safari, Edge/Windows, physical Quad/Octo output, subjective
  listening parity, and performance on minimum-spec hardware.

## 2026-10-05 - OUTPUT TIME And Octo Labels

- **Scope:** HTML/CSS/app UI only. No changes to spatial DSP, curve interpolation, speaker-layout module, output meter analyzer, resampler, or WAV renderer.
- **Browser:** Codex in-app Chromium. CSS viewports 1280x800, 1920x1080, 720x800 and approximately 1366x768 (reported 1365x768 because browser zoom is 90%). No horizontal page overflow. Laptop waveform, spatial display and transport fit; narrow layout scrolls the full Spatial View above the fixed bar. Octo labels 1-8 are readable.
- **Default source:** 45-second mono noise. Stopped click/drag selected time without starting playback; playing drag resumed with meter activity. End and restart via Spacebar passed. Waveform seeking preserved point count; curve add/erase returned 2 -> 3 -> 2.
- **Real sources:** stereo `sample.mp3` (9.103125s decoded) and JUCE example `cello.wav` (mono, approximately 1.04s). File loading, source lane count, stopped click, playing drag and Stop checked. These are execution checks, not listening approval.
- **Actual downloaded artifacts:** `space-curve-lab-2ch-48k-24bit (4).wav`, `space-curve-lab-4ch-48k-24bit (1).wav`, `space-curve-lab-8ch-48k-24bit (1).wav` in Downloads. Parsed RIFF headers verify 2/4/8 channels, 48000 Hz, 24-bit PCM, 436950 frames / 9.103125s each.
- **Automated checks:** changed app.js syntax and git whitespace checks passed; source RMS channel-ratio and silence/short-buffer checks passed. Served app.js matched the local file byte-for-byte. Cache version: `20261005-output-time-02`.
- **Console:** no errors or warnings observed during the local lifecycle checks.
- **Limitations:** no subjective listening, physical multichannel routing, Safari/Windows validation, long-file stress test, or reverb-history reconstruction verification. Exact pre-fix visual reproduction was not retained; the clipping cause was established from the fixed radius and backing-canvas dimensions.

## 2026-10-06 — Band-limited Render preparation (local, unpublished)

Decoded PCM is converted to 48 kHz with a 96-tap Blackman-windowed sinc before the unchanged spatial DSP. Already-48 kHz input bypasses conversion. Mono/stereo count is retained; output length is round(sourceFrames * 48000 / sourceRate). No parameter, speaker order, Preview, fade or gain changes.

Browser preparation/encoding tests: 30 passed, including four rates, mono/stereo input and stereo/quad/octo WAV headers and duration. 30 kHz rejection: 88.2→48 kHz -90.17 dB; 96→48 kHz -98.35 dB. Previously -3.12 dB and 0 dB respectively in the tested in-app browser. Test: tests/browser-render-resampling.html; converter checks: tests/render-resampling.mjs. These are synthetic numerical checks, not physical-speaker/listening, long-file or cross-browser certification.

### Release gate — 2026-10-06

Actual app loaded a 6-second 96 kHz stereo fixture; Play/Stop succeeded. Saved Stereo/Quad/Octo WAV files were inspected on disk: 2/4/8 channels, 48000 Hz, 24-bit, 288000 frames (6 seconds) each. Stereo WAV reopened in the app as 6 seconds. Browser console had no errors/warnings. Together with the 30-case conversion/encoding test this validates the scoped resampler change; long files, DAW multichannel playback, listening and cross-browser checks remain open.

## 2026-10-06 — Stereo Render input preservation (local candidate)

User authorized eliminating stereo mono-sum loss and avoiding severe cancellation. Two-channel export now has a separate linked-stereo branch; mono and 4/8ch code paths are unchanged. Each source has independent low-pass and two-channel diffuse state. Each contributes at gain 0.5 before the existing distance mapping and output ceiling. The mono-sum equations above describe the historical dc7e78e stereo-input path only.

Let theta be Direction radians and w=1-0.32d. halfSpan=max(0.5,abs(cos(theta))*sqrt(0.5)*w); center=clamp(sin(theta)*sqrt(0.5)*w,-1+halfSpan,1-halfSpan). Left/right source pans are center-halfSpan and center+halfSpan, followed by the existing equal-power cosine/sine gains. The gap floor and fixed source order intentionally prevent the direct two-by-two mix matrix from becoming singular at side positions. This is a stereo projection with limited lateral concentration, NOT literal rear source swapping or HRTF parity. The floor is an engineering candidate, not a listening-approved parameter. No artificial decorrelation, phase inversion, or input-dependent normalization is introduced.

QA: 864 fixed-angle 48k/24-bit WAV cases (0/90/180-degree source phase, 72 angles, bypass on/off, Distance 0/1). No complete loss, and tested rotation RMS span <3dB (anti-phase worst 2.784dB). Mono stereo/quad/octo and stereo quad/octo: 10 byte-identical cases against dc7e78e. L-only/R-only survive; hot rotating input stays within 0.98 ceiling. These narrow tone fixtures do not certify arbitrary music, frequency-dependent cancellation, physical speakers, or moving-curve listening. Browser anti-phase file loading, Play and render completion passed with no warning/error logs; download-event timed out, so actual disk persistence/reopen is NOT verified this turn. Resampling regression passed.

Evidence and repeatable QA are in the family workspace: SPACE_STEREO_SAFETY_CHANGE.md, qa/space-stereo-safety.mjs, evidence/space-stereo-safety.json. No commit/deployment yet. Multichannel shared diffuse state remains a separate pending investigation.

## 2026-10-06 — Moving stereo follow-up

`tests/stereo-motion.mjs`: 36 conditions (80/997/10000 Hz × source phase 0/90/180 degrees × Distance 0/1 × clockwise/counterclockwise). Each 4-second curve traverses one full turn. Interior 50ms stereo-energy windows, excluding 100ms at each boundary, remain non-silent; minimum RMS 0.008842, maximum within-case window range 2.801dB. WAV length/rate/24-bit and ceiling pass. These are synthetic steady tones, not an all-signal or listening guarantee.

Browser QA using the product renderer generates a moving anti-phase WAV and re-decodes it as 2ch/48k/2s; header 24-bit, 576044 bytes, peak 0.04108. In-app browser download and downloadMedia time out, so normal browser-download persistence remains unverified. Separately, the same product renderer in Node writes an actual WAV to disk; opening that file in the app shows 2 seconds/2ch, Play advances the cursor and both meters, natural end restores Play, no console warnings/errors. This verifies disk WAV readability and playback lifecycle, not the browser download path or perceptual quality. Evidence: family workboard evidence/space-stereo-motion.json, space-stereo-motion-render.wav, space-stereo-reopened.png. Listening on real stereo material remains pending. No further product DSP change in this follow-up.

## 2026-10-06 — Browser download release gate passed

Brave standard Download WAV followed by native Save produced an actual 576044-byte, 48kHz/24-bit/2ch/96000-frame WAV from the 2-second anti-phase input. Measured peak 0.0370549 (not silence). SHA256 1f542a01b6df7d07985d8809838ea424f9602a8ac310e75e432b0dd9d8be8969. Reopening this downloaded file in the app shows 2s/2ch; Play advances cursor and both output meters; no console warnings/errors. This supersedes the pending ordinary-download gate above for this browser/fixture only. In-app automated download acquisition remains a tooling limitation. User authorized commit/deployment after validation; listening on musical stereo material remains a later family tuning step, not a completed perceptual approval.

## 2026-10-06 — Correct multichannel stereo room clock

At baseline 002982d, Quad/Octo shared per-output diffuse tanks between input L/R; addPointSource advanced the same indices twice per stereo frame. An impulse at sample 960 with only one populated input produced its first diffuse reflection at 21.5ms instead of the mono 43ms. This was reproduced for both L-only and R-only in Quad and Octo.

Allocate independent per-source/per-output tanks; each now advances once per audio frame. Delay lengths 43/79ms, feedback coefficients, direct panning, speaker order, distance curves, WAV ceiling/fades/duration and Preview remain unchanged. Stereo multichannel room timing and texture intentionally change; mono and all 2ch outputs are preserved. Stereo diffuse memory doubles versus the old shared-bank implementation: at48k, Octo adds about183KiB of Float32 delay storage. No tail extension.

Node tests/multichannel-room-clock.mjs and browser tests/browser-room-clock.html pass all four cases at43ms, with mono versus correctly aligned one-sided stereo WAV PCM difference zero. QA regression preserves22 unaffected WAV cases byte-for-byte; two-source superposition matches within one24-bit LSB. Existing36 stereo motion cases and resampling regression pass. Browser decoded4/8ch and0.5s correctly. These are synthetic engine/runtime checks, not listening or physical-speaker certification.

## 2026-10-06 — Responsive export worker (local, not deployed)

App export now uses render-client.js and a disposable module render-worker.js; existing synchronous renderSpatialWav remains the DSP reference. Source channels are cloned (Preview is not detached), output WAV transfers back. Source, curve points, format and bypass are snapshotted at start. Cancel Render aborts rate preparation or terminates the worker, suppresses download, and restores controls. Errors also restore controls. Worker execution is not a memory reduction or low-end certification.

Browser tests/browser-worker.html: six format/bypass cases match synchronous WAV bytes, cancellation/recovery pass, 60s Octo completes with51 timer ticks rather than blocking main thread for about1s. Actual app180s stereo/8ch cancellation reaches cancelled with controls restored, no console errors. tests/render-preparation-cancel.mjs verifies mid-conversion and pre-abort. New worker download persistence/reopen and repeated memory recovery remain pending; musical listening not performed. Family workboard SPACE_WORKER_CHANGE.md holds baseline profiles and evidence.

## 2026-10-06 — Worker release gate passed

Browser worker suite now repeats cancel/short rerender five times, each WAV byte-identical to synchronous reference; six format/bypass parity cases and source preservation pass.60s Octo finished in1084ms with54 UI timer ticks in this run. Brave normal Download WAV/native Save produced45s/8ch/48k/24-bit/2160000frames, SHA25682dbd1b4bf027090a096a9b34b75bfe9c0a42bc237a238b060e7433e0041d5d3. Actual file reopens as45s/8ch and Play/Stop works without console warnings/errors. Preview still uses first two channels; this is not physical8ch playback certification. This supersedes pending worker file persistence/reopen for this tested case. Memory recovery/low-end devices and musical listening remain unverified. Family evidence: space-worker-download.json, space-worker-final.txt, space-worker-download-reopened.png.

## 2026-10-07 keyboard routing
Local browser reproduced Space on Reset Cancel starting Preview behind the dialog. After repair, Space cancels without playback; Tab then Space confirms and closes. Space on Render format opens the native menu without playback. Event-routing, stereo-motion and render-resampling checks pass. Physical speaker/listening approval is not implied.


## 2026-10-11 — Multichannel panning scratch reuse (local candidate)

Replace per-source/per-frame layout.map/reduce allocation with one render-owned Float64Array and an ordered summation loop. Each call overwrites every weight before use; sequential L/R calls can share the scratch. This removes 17,280,000 weight-array allocations for a 180s stereo render. Preserve double precision, channel and summation order, direction/distance mapping, room state, fades, global peak normalization and WAV format. No realtime Preview changes. Baseline is 9c316a9.

24 mono/stereo × Stereo/Quad/Octo × bypass × moving/static fixtures match baseline WAV bytes in Node. Existing room-clock4 and stereo-motion36 checks pass. Safari fresh-process 180s Octo4 runs complete, each207,360,044bytes; heartbeat max25ms. Memory comparison is a bounded observation, not leak-free/low-spec certification. Full workboard report: SPACE_WEIGHT_REUSE_2026-10-11.md. Listening deferred by user.

Safari baseline comparison additionally passed24 full-WAV cases. Existing browser-worker.html terminal PASS covers6 format/bypass parity cases,5cancel/recovery cycles and60s Octo/source/heartbeat assertions. Long JSON AX truncated; no individual timing values asserted. RSS single1848.25→1318.27MiB; repeated2294.11→1713.77MiB in fresh-process bounded comparison. Not fully reclaimed or leak-free; real-file app download smoke remains open.


## 2026-10-11 — Weight reuse real-file export and release preparation

Safari local app: Open Audio selected recovery-8s-test.wav, decoded stereo8s, selected Octo8ch, clicked Download WAV without Play. Actual saved file is9,216,044bytes,384,000frames,48kHz24bit8ch8s; SHA25664ec315ee20080ef80451e1d238698ce6e68c4a1722c79b8e5da5564d6f78528. Synthetic fixture loaded via actual native file picker, not musical listening. App meter stayed -infinity. Cache version updated through index→app→render-client→render-worker→offline-render to20261011-weight-reuse1. Workboard evidence/space-weight-real-download-20261011.json. Public rollout verification is recorded separately after push.


## 2026-10-14 — Independent FDN Reverb (local candidate)

See [implementation and verification contract](REVERB_IMPLEMENTATION_2026-10-14.md). Adds Reverb enable, Amount35%, nominal Decay1.2s (0.3–4s), optional Distance-linked send (default on), and positive Distance On control. One shared eight-line FDN replaces the app's previous room paths; no duplicate room send. Direction/Distance curves and48k/24-bit/channel layouts remain. Reset All restores the new settings. Audio voicing is NEEDS LISTENING TEST; full Preview/Render spatial parity is not claimed.


## 2026-10-14 — Reverb becomes an independent curve

Supersedes the earlier same-day scalar/link UI: [Reverb curve contract](REVERB_CURVE_2026-10-14.md). Direction → Distance → Reverb edit selectors each have a separate power button; values survive Off. Reverb uses normalized0–100% smoothstep send curve, default35%; fixed Decay appears only for Reverb. No visible checkbox/link controls or app Distance-to-room coupling. Preview/export both read the curve. Local verified candidate, not deployed or listening-approved.


## 2026-10-14 — Family-style module toggles replace separate power controls

User explicitly rejected separate power buttons. Direction/Distance/Reverb buttons now directly toggle their effect; enabling selects that curve, disabling selects the first remaining enabled module. When all are off, the readout says All Off and pointer editing/Clear Current are disabled. Stored curve points remain intact. Button aria-pressed and colored border represent enabled state; underline represents selected editor. Reset All restores module defaults. This supersedes earlier same-day separate-power descriptions.

Verified in the browser: all three off, Reverb alone on, add a point and toggle off/on retains three points; no console errors. HTML/CSS/event changes only; FDN and export DSP unchanged. Decay remains static: a future Amount/Decay sub-curve selector is a proposal only. No commit/deployment this turn.


## 2026-10-14 — Reverb Amount release gate

User authorized release after bounded validation. Reverb27 decay cases,12800 static and51200 moving-send worklet/reference frames,12 format/bypass/link fixtures and curve-specific2/4/8ch comparisons pass. Existing24 legacy WAV fixtures, resampling, preparation abort,4 room-clock cases,5 transport keyboard tests and28 AIFF checks pass.

Current browser app: imported2-second stereo file, edited Amount to three points, observed changing59–61% readout during playback, and saved2/4/8ch WAVs with no console errors. Saved headers confirm48kHz/24-bit,95999 frames (known one-sample decode/resampling boundary difference), all peaks within0.98. Previous same-build interaction checks cover toggles/value preservation, All Off and Reset All. No blocking regression found within these checks.

Release scope includes shared FDN core, independent Amount curve, static Decay and family-style module toggles. Direct-path Preview/Render differences, background-tab scheduling, endpoint-truncated tails, one-sample browser boundary rounding, comparative listening and physical speakers remain open. Automated kernel parity is not complete perceptual parity or low-spec certification.


## 2026-10-14 — Direction-only default verification

Browser fresh load: Direction on, Distance/Reverb off. Enable Distance and Reverb, confirm Reset All: Direction selected/on, both others off, hidden distanceBypass true, Reverb settings hidden. Syntax and diff checks pass. Initial static Distance readout also changed to Off. DSP algorithms unchanged.


## 2026-10-14 — Readable default noise pulses

User requested a better default waveform and release. The prior45s demo repeated45.833ms bursts separated by20.833ms (about15Hz), producing a dense striped overview. Keep45s/mono/seed45066/gain0.32, but use1.2s bursts +1.3s gaps, attack80ms/decay340ms/sustain0.22/release600ms. Repeating six-event amplitude accents0.72/0.9/0.62/1/0.8/0.56 give18 distinct pulses. This intentionally changes only generated demo cadence/envelope, not imported audio or spatial DSP. The waveform remains derived from real PCM; reduce its outline opacity0.62→0.28 to avoid harsh edges.

Browser visual inspection, default playback/pause and download pass with no console errors. Actual WAV:2ch/48kHz/24-bit/exact45s. Direction-only startup preserved. Syntax/diff checks pass; musical listening is not certified.


## 2026-10-14 — Spatial labels and faster demo (local)

User identified optical imbalance at stereo R and Octo3/4. Speaker labels now face inward on both sides, using measured glyph width, a12px anchor offset, middle baseline and frame-safe text bounds. Actual speaker dot positions, angles, channel order and audio routing are unchanged. Stereo/Quad/Octo were visually inspected in the1422x800 browser viewport.

Default demo repetition period is halved2.5s→1.25s: burst1.2→0.6s, gap1.3→0.65s; attack/decay/release also halved to40/170/300ms to preserve envelope proportions. Duration45s, gain, seed and accent pattern remain;36 pulses instead of18. Playback/pause and browser console checked; syntax/diff checks pass. No commit/deployment requested for this turn; local changes only.


Release authorization: user subsequently requested commit and deployment of the spatial-label and double-tempo demo changes. Prior local-only notes record the earlier stage. No additional DSP changes in this release.


## 2026-10-14 — Keyboard UI release verification
Runtime e664f03: Open Audio is reachable by Tab with visible focus; Enter opens the chooser and a 4-second stereo48k WAV loads. Reset dialog initially leaked Shift+Tab to background CLIP; fixed Tab/Shift+Tab cycling, Space cancel, Enter confirm, focus restoration and no unintended playback verified in IAB. transport-keyboard and reset-focus suites plus JS syntax passed. Reverb/Octo expanded layout remains scroll-accessible. Actual125% zoom and other-device/native-dialog checks remain unverified. No DSP or listening decision; filter response difference remains for listening. Family report: COMMON_UI_KEYBOARD_PANELS_2026-10-14.md under CurveLabWebV1; deployment evidence retained there.
