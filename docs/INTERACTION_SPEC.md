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

### Position

- The bottom Position slider represents normalized source time from zero to one.
- Moving it updates time, waveform/curve playheads, readouts, and Spatial View.
- While playing, seeking fades the previous source graph and starts a fresh graph
  at the selected source position; while paused, it preserves the selected position.
- Seeking to the exact end follows natural-end semantics and returns to zero.

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

- macOS: Command plus primary click temporarily erases in Pen mode.
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

- Position slider, time display, waveform playhead, curve playhead, current values,
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
