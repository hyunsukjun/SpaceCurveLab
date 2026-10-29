# Interaction Specification

Baseline: 2026-09-30 current implementation.

This document defines user intent rather than browser event names. A Standalone
implementation may use different event APIs while preserving these behaviors.

## Application Start

- Generate and install the default mono noise-interval sample automatically.
- Enable Play, Stop, and Download WAV after installation.
- Start at time zero with Direction active, Pen selected, Distance Bypass off,
  Stereo 2ch selected, and both curves at their neutral defaults.

## Open Audio

- The user chooses a local audio file.
- Playback stops and controls show a loading state.
- Successful decode replaces the default/current sample, rebuilds the waveform,
  reports duration/channel count, and returns position to zero.
- Failed decode reports `Cannot decode audio file`, disables unavailable actions,
  and does not upload or transmit the file.

## Transport

### Play

- Start from the current paused position.
- If position is within 20 ms of the end, restart from zero.
- Button label becomes Pause while playing.

### Pause

- Preserve the current source-time position.
- Fade the current graph out before disconnecting it.
- A subsequent Play builds a fresh graph and resumes from the preserved position.

### Stop

- Fade out, disconnect the active graph, and return position to zero.

### Natural End

- Return to time zero and Play state.
- One subsequent Spacebar or Play action must restart immediately.

### Spacebar

- Toggle Play/Pause when audio exists and the user is not typing.
- Ignore key repeat.
- Do not double-trigger a focused button; blur focused buttons before toggling.

### OUTPUT TIME

- The existing source waveform below the curve editor replaces the bottom Position slider.
- Click/drag updates time, waveform/curve playheads, readouts, and Spatial View without editing points.
- While playing, seeking fades the previous source graph and starts a fresh graph
  at the selected source position; while paused, it preserves the selected position.
- Seeking to the exact end while playing returns to zero; while stopped it selects the end, and Play restarts from zero.
- Current position uses a bright solid line with top/bottom triangles. Hover uses the same bright dashed line, with no triangles or time label; hide it during dragging and outside the plot.
- Arrow keys seek one second; Shift+Arrow seeks 0.1 seconds; Home/End select boundaries.
- Show one MONO lane or two L/R lanes from the input, labelled SOURCE WAVEFORM. These are not rendered spatial output channels; choosing Octo must not create eight waveform lanes.

### Output Meter

- Display the final browser Preview output as separate L/R RMS and peak levels.
- Hold recent peaks briefly; latch CLIP at or above the documented threshold.
- Clicking CLIP clears only the latched warning and does not change audio.
- Meter activity does not imply that the selected offline render format is being
  auditioned; Quad and Octo remain offline speaker-map outputs.

## Parameter Mode Selection

- Direction and Distance choose the active editable curve.
- Both trajectories remain visible, but only the active curve displays points and
  accepts hit-testing/editing.
- Status readout and vertical scale immediately reflect the selected curve.

## Pen

- Pen is the default persistent tool.
- Pressing empty curve space creates one point in the active curve.
- Dragging the new point begins immediately.
- Pressing an existing active-curve point selects it for movement instead of
  creating another point.
- Dragging maps horizontal position to normalized time and vertical position to
  normalized parameter value.
- Interior points may move in both axes and are sorted by time after movement.
- First and last points remain fixed at normalized time 0 and 1, but their values
  may be moved vertically.

## Eraser

- Eraser is a persistent selectable tool with selected-button and cursor feedback.
- Pressing an existing interior point deletes only that point.
- Pressing empty space does nothing and must never add a point.
- First and last points cannot be deleted.
- Erasing does not affect the inactive curve.

## Temporary Eraser Modifier

- macOS: Option plus primary click temporarily erases in Pen mode.
- Windows/other PC baseline: Ctrl plus primary click temporarily erases.
- Releasing the modifier returns behavior and cursor to the selected persistent tool.
- Losing window focus clears the temporary state.
- Windows physical Ctrl-click verification is still required.

## Hover Feedback

- Hovering within the active point hit radius shows its exact mapped value.
- Direction displays rounded degrees; Distance displays two decimal places.
- Hovering does not change product data.

## Clear Current

- Immediately restore only the active curve to its two-point default.
- Direction default is zero degrees; Distance default is Near zero.
- No confirmation and no undo are currently provided.

## Reset All

- Open a confirmation dialog without changing state.
- Cancel button, Escape, or backdrop click closes the dialog without reset.
- Confirm restores both curves and timeline position to zero.
- Focus enters the dialog on Cancel and returns to Reset All when it closes.

## Distance Bypass

- Toggle comparison of Direction-only motion against Distance processing.
- Preserve the Distance curve and continue to display it when selected.
- Update readout, Spatial View, active Preview, and future Render immediately.
- Bypass does not disable Direction or spatial panning.

## Render Format

- Select Stereo 2ch, Quad 4ch, or Octo 8ch.
- Immediately update Spatial View speaker labels and engine/status text.
- Do not change the realtime headphone Preview engine.
- Download WAV renders the selected format using current curves and bypass state.

## Download WAV

- Disable the command and show Rendering while calculation is active.
- Prepare the decoded input at 48 kHz, then generate one interleaved 24-bit PCM
  WAV named with channel count, `48k`, and `24bit`.
- Report downloaded channel count or render failure, then re-enable the command.
- No separate Render button is part of the workflow.

## Timeline And Visual Synchronization

- OUTPUT TIME, time display, waveform playhead, curve playhead, current values,
  motion readout, and object position share one normalized source-time value.
- Spatial View is view-only in v1.

## Resize

- Resize may change Canvas presentation dimensions and backing-store dimensions.
- Existing normalized points and their parameter/time meaning must remain unchanged.
- Pointer conversion must account for CSS size versus Canvas backing-store size.

## Known Interaction Gaps

- No undo/redo, point keyboard editing, touch-specific gestures, numeric entry,
  preset/state save, or point-density management.
- Interior points can occupy equal or nearly equal times; no minimum separation
  rule is defined.
- Accessibility of Canvas point editing beyond the surrounding controls is
  `TO BE DOCUMENTED`.

## 2026-10-06 — Responsive export worker (local, not deployed)

App export now uses render-client.js and a disposable module render-worker.js; existing synchronous renderSpatialWav remains the DSP reference. Source channels are cloned (Preview is not detached), output WAV transfers back. Source, curve points, format and bypass are snapshotted at start. Cancel Render aborts rate preparation or terminates the worker, suppresses download, and restores controls. Errors also restore controls. Worker execution is not a memory reduction or low-end certification.

Browser tests/browser-worker.html: six format/bypass cases match synchronous WAV bytes, cancellation/recovery pass, 60s Octo completes with51 timer ticks rather than blocking main thread for about1s. Actual app180s stereo/8ch cancellation reaches cancelled with controls restored, no console errors. tests/render-preparation-cancel.mjs verifies mid-conversion and pre-abort. New worker download persistence/reopen and repeated memory recovery remain pending; musical listening not performed. Family workboard SPACE_WORKER_CHANGE.md holds baseline profiles and evidence.

## Spacebar routing (2026-10-07)

Spacebar dispatches at most one transport action per physical press. Held-key repeats are consumed, and disabled Play or an absent source blocks dispatch. Input, select, textarea and editable-text targets retain native keydown/keyup behavior. Existing Play/Stop or Play/Pause semantics and DSP are unchanged. While Reset All is open, both Space events are left to the dialog buttons: Cancel and confirmation remain keyboard-operable without toggling background transport.


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


## 2026-10-14 — Family file information

Approved circular dotted-i disclosure immediately left of Open Audio. Default format guidance moves into this optional panel; privacy and actual error/status notices remain. Space operates disclosure without audio transport; Escape/outside click dismiss. Output guidance: Source duration · 2 / 4 / 8 channels · 48 kHz / 24-bit WAV. Input limits reflect current implementation, not a device-memory guarantee. No DSP, admission, export, IDs or defaults changed.

Family verification: all six information panels passed desktop/narrow bounds and Space/Escape/outside-click checks; shared keyboard regression 27/27 passed. Existing dynamic errors and audio handlers unchanged. User approved commit and publication on 2026-10-14. Release evidence in family FILE_HELP_2026-10-14.md. Earlier Audio-only pilot status is superseded.


## 2026-10-14 — Family parameter help

Static parameter descriptions are available on the relevant buttons using the Audio help design; current values, axes and activation feedback remain visible. See `docs/PARAMETER_HELP.md` (or `PARAMETER_HELP.md` in this directory). No DSP or curve mapping changes.


## 2026-10-14 — Open Audio keyboard access
파일 입력을 display:none 대신 시각적으로만 숨겨 Tab과 Enter/Space로 기본 파일 선택기에 접근하도록 수정. 포커스는 기존 fileButton:focus-within 윤곽선으로 표시한다. 파일 디코딩·처리 계약은 변경하지 않는다.


## 2026-10-14 — Reset modal focus
Reset 확인창의 Tab/Shift+Tab은 Cancel과 Reset All 사이에서 순환한다. Escape 취소와 닫은 뒤 Reset All 포커스 복귀는 유지한다. 확인창 뒤의 버튼을 키보드로 우발 작동하지 않도록 보완하며 리셋 대상과 음향 처리는 변경하지 않는다.

## Information-density pilot — local review, 2026-10-15

Selected parameter name/value visible; statistics and full overview in disclosure. Existing curve evaluation at playback position; input channels, headphone preview and Spatial View retained. All original readout IDs and update sources preserved. Details summary Space does not start transport. COMMON CANDIDATE for standalone; not committed/deployed.

## Readout disclosure rollback — 2026-10-15
User requested removal of the newly introduced Details disclosures across the family. Original always-visible readout panels restored; Oscillator retains its pre-existing Synthesis detail panel and original contents. Value computation and audio behavior unchanged. Do not add disclosure or restructure information during color/minor-UI work. Audio also removes the border above EDIT AUDIO.

## Export feedback visibility
Idle WAV ready/not ready/needs export badges are hidden. The Download control retains its normal state. Progress, cancellation, limits and failure feedback remain visible; status values are not audio-engine inputs.

### Canvas density / resize correction — 2026-10-15 (local review)
Waveform and curve draw in CSS-pixel dimensions measured from their displayed rectangles; backing stores follow device pixel ratio. Pointer/seek mapping uses those same logical dimensions, preserving normalized data, ranges and timing. Element ResizeObserver handles control wrapping. Spatial View uses a 480-unit square view box so circles and speaker layout remain proportionate. No audio graph change.

Expanded-editor layout (2026-10-15): viewport/control resizing changes canvas display dimensions only. Existing canvas sizing observers update backing stores and pointer coordinates; Oscillator additionally observes its main canvas. Curve data and transport state are retained. If controls plus minimum canvas exceed viewport height, use page scrolling rather than covering controls or compressing the editor.


## 10 ms playback boundary candidate — 2026-10-25

The current local candidate supersedes earlier automatic transport-boundary durations with the [10 ms playback/WAV contract](PLAYBACK_BOUNDARY.md). Source/effect envelopes are separate. See that contract for pause-state retention, existing tail-length limits and verification status. Uncommitted; listening acceptance pending.

## Readout context family release — 2026-10-27

Angle and Distance captions identify output-playhead curve values; Off, bypass, spatial/channel mapping unchanged. No new gesture, seeking, point selection, transport command or audio mutation is introduced by displaying these values. See `READOUT_CONTEXT_CONTRACT.md` for basis, source-range rules, verification boundary and portability.

## Shift group / Option erase — 2026-10-27

Current gesture contract supersedes earlier Mac Command erase statements only. Shift captures the clicked point and ordered suffix in the active curve, fixes all X and applies one normalized Y delta with common bounds. Option-click temporarily erases on Mac, Ctrl-click on PC. Esc/cancellation restores the pending group. Existing normal editing and source/transport semantics remain. See [gesture contract](CURVE_GESTURE_CONTRACT.md).


## Channel selector placement — 2026-10-28

The existing output-format selector sits directly before Pen/Eraser, after Reverb in Space or Pitch High in Granular. Selector and tools wrap together. Native select keyboard/focus semantics, IDs, Stereo default and stereo/quad/octo values, disabled/processing rules and Preview/Render meanings remain unchanged. Approved for release after local visual review. Verified channel selection, toolbar wrapping and keyboard focus; DSP and export processing are unchanged.


## Contextual shortcut guide — 2026-10-28

APPROVED WEB UI. The native Shortcuts disclosure reuses file-information behavior and Graphite roles. Click/Enter/Space opens it without changing transport. Escape closes it before background gesture cancellation and returns summary focus; outside press, Tab leaving, outer scroll/resize dismiss; internal scrolling stays usable. Shortcuts follows the editing tools; Space/Granular retain the channel selector immediately before Pen/Eraser. No assignment, point/mapping, select/Space routing, chain keyboard logic or Preview/Render behavior changed.

## Failed input retains the valid source (2026-10-29)

Supersedes earlier failed-decode behavior that cleared a source. File attempts still stop playback; rejected candidates do not reset source edits/window/curves or replace waveform/IR/analysis. Show the error and prior-source availability; do not autoplay. Completed old WAV availability follows unchanged source/settings; invalidate it on successful replacement. See [input contract](INPUT_VALIDATION.md).
