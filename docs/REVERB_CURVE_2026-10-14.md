# Reverb curve and unified module controls — 2026-10-14

Status: local candidate; supersedes the earlier independent-room UI proposal and initial implementation controls. No new Space commit/deployment.

## Approved interaction

Top row: Direction, Distance, Reverb. Each module has a main edit-selection button and a separate power button, both keyboard reachable and aria-pressed labelled. Selection does not toggle power; power does not select a different curve. Off retains editable curve points. Direction Off uses zero rotation (preserving stereo source spread), Distance Off bypasses distance processing, Reverb Off mutes the wet path. Direction Off is not an all-spatial dry bypass.

Remove visible Distance On / Link to Distance / Reverb checkbox and static Amount slider. Retain hidden stable distanceBypass as the inverse Distance power state for the existing graph. All three modules default enabled. Reverb is now independent at Near too, so default35% produces room even at Distance0; this intentionally replaces the earlier linked default that was silent at Near.

## Reverb curve

Normalized x=time, y=send amount0…1; same smoothstep interpolation and Pen/Eraser/protected endpoints as existing curves. Purple line and0/50/100% axis. Default/Clear Current is a flat35% line. Decay remains a static0.3–4s setting, default1.2s, visible only when Reverb is selected. Amount is wet input send, not dry/wet crossfade: a zero segment stops new excitation while existing tails decay. Reverb power Off additionally mutes the wet output. Reset All restores all curves, powers and Decay.

Preview samples the curve at playback time through shared roomSend/sampleRoomCurve; offline receives a cloned curve snapshot and samples per frame. FDN engine, speaker layouts, PCM24/48k format, source-length endpoint/tail policy remain unchanged. Existing display-clock scheduling and direct-path Preview/Render differences remain open; this change does not resolve them.

Legacy roomSend scalar/link inputs remain for the first prototype's comparison tests only. The current app always passes independent amountCurve; no hidden Distance→Reverb coupling remains in its room send.

## Verification

Node tests/reverb-core.mjs: existing27 decay fixtures,12800-frame worklet/core match and12 exports pass; added shared curve interpolation, Distance independence, byte-identical zero-curve/off outputs, and nonzero moving-curve output in2/4/8ch pass. Syntax and diff whitespace checks pass.

Browser: selects Reverb and shows percentage axis/Decay; adds a third point; toggles Reverb off/on without losing points; disables Direction and Distance while Reverb plays independently; loads a2-second stereo WAV and observes changing Amount during playback; saves stereo48k/24-bit output without console errors; Clear Current restores two default points. Reset/power restoration also checked. No comparative listening or physical speaker certification. Prior one-sample decode/export boundary discrepancy is retained as a separate known observation.


## 2026-10-14 — Family-style module toggles replace separate power controls

User explicitly rejected separate power buttons. Direction/Distance/Reverb buttons now directly toggle their effect; enabling selects that curve, disabling selects the first remaining enabled module. When all are off, the readout says All Off and pointer editing/Clear Current are disabled. Stored curve points remain intact. Button aria-pressed and colored border represent enabled state; underline represents selected editor. Reset All restores module defaults. This supersedes earlier same-day separate-power descriptions.

Verified in the browser: all three off, Reverb alone on, add a point and toggle off/on retains three points; no console errors. HTML/CSS/event changes only; FDN and export DSP unchanged. Decay remains static: a future Amount/Decay sub-curve selector is a proposal only. No commit/deployment this turn.
