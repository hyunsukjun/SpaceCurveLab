# Playback boundary — 10 ms (2026-10-25)

Status: implemented and technically verified; user authorized commit and public release on 2026-10-25. Subjective listening acceptance remains separate.

- Linear 10 ms attack on Play/resume and 10 ms final release on natural end.
- Pause continues rendering through its release, then retains the resulting position. Audio-thread processing ends at zero; context-based graphs suspend after zero acknowledgment/ramp completion (control delivery can add silent quanta).
- A release starts from current gain, including an interrupted attack; natural/pause gain is not stacked in the sample envelope.
- WAV output receives one boundary at the completed output's first/last samples. Output length, channel layout, source PCM, curves and effect parameters remain unchanged. Very short output shortens the boundary. Dither may contribute one least-significant bit.
- Explicit reset, invalidating edits/file replacement and error cancellation retain their immediate safety-stop semantics; these are not ordinary Pause.
- This treatment addresses transport discontinuities, not clipping or clicks within an imported recording.

## Module-specific integration

The former 8 ms envelope is replaced. Pause retains the source/room graph by suspending the context after gain reaches zero. Existing source-duration output policy remains: post-source room tails are not extended by this change.

## Verification and limits

Shared local evidence: `work/CurveLabWebV1/qa/fade10/` in the Interface workspace. Includes finite-output/short-file tests, release-frame and resume checks, completed browser WAV checks for six Labs and dry/IR Oscillator, plus affected regression logs. Browser/device listening is not inferred from these numeric checks. Release authorization does not imply subjective listening acceptance.


## Preview release anchor — 2026-10-29 (release approved)

The previous release could drop abruptly before its intended 10 ms ramp. The candidate explicitly anchors current scheduled gain at the current audio time in Pause and retiring-graph fades; interrupted attack, natural-end overlap and repeated release retain their current values and earlier deadline. Source/room retention, pause position, HRTF preparation/motion, spatial maps, curves, channels, WAV and tail duration are preserved. See [contract, evidence and limits](PREVIEW_ENVELOPE_2026-10-29.md). Local verification is complete; user authorized commit/publication on 2026-10-29. Public proof is separate; listening acceptance remains unclaimed.
