# Space Curve Lab Agent Rules

This file is the top-level working agreement for human and AI contributors.
The current web application is the executable reference implementation. The
long-lived asset is the product behavior, parameter knowledge, DSP response,
interaction model, and the reasons behind fine-tuning decisions.

## Scope

- Work only in Space Curve Lab unless another project is explicitly named.
- Audio Curve Lab may be inspected as the shared visual-system reference, but
  its features must not be copied into Space Curve Lab by default.
- Preserve Space Curve Lab's Direction, Distance, spatial preview, speaker
  layouts, and render behavior.

## Before Changing Anything

1. Inspect the current HTML, CSS, JavaScript, Canvas, audio graph, render path,
   and existing documentation.
2. Prefer code and verified runtime behavior over assumptions.
3. Check the Git working tree and preserve unrelated user changes.
4. Identify whether the request affects product behavior, processing/data,
   platform implementation, or more than one layer.
5. Report code/document conflicts instead of silently choosing one as truth.

## Protected Behavior

Do not change these without an explicit product or DSP request:

- Web Audio graph and DSP algorithms
- Direction and Distance ranges, units, defaults, mapping, and interpolation
- normalized curve coordinate system
- point add, move, delete, and endpoint protection
- Pen/Eraser and Command/Ctrl temporary erase behavior
- Play, Pause, Stop, Spacebar, natural end, and restart behavior
- local file loading and generated default sample
- Preview, spatial visualization, speaker numbering, channel order, and WAV export
- fixed Render output at 48 kHz / 24-bit PCM
- Canvas/audio timeline relationship
- stable parameter IDs: `direction`, `distance`, `distanceBypass`, `renderFormat`

Do not rename HTML IDs or JavaScript-referenced classes for visual convenience.
Do not perform large refactors or add dependencies without explicit approval.

## Three Layers

Keep these concepts separate even when they currently share a file:

1. **Product behavior:** what the musician hears, sees, and does.
2. **Processing/data model:** normalized curves, mappings, interpolation, DSP,
   channel layouts, render rules, and state semantics.
3. **Platform implementation:** HTML, CSS, Canvas, Pointer Events, Web Audio,
   Blob download, and browser workarounds.

Standalone readiness means preserving layers 1 and 2 well enough to reproduce
them on another platform. It does not mean prematurely rewriting the web app.

## Documentation Is Part of Completion

- New or changed feature: update `docs/FEATURE_REGISTRY.md`.
- Parameter or mapping change: update `docs/PARAMETER_SPEC.md`.
- Interaction change: update `docs/INTERACTION_SPEC.md`.
- DSP, smoothing, level, or render change: update `docs/DSP_BEHAVIOR.md`.
- Important product decision or tuning history: update `docs/DECISIONS.md`.
- Standalone impact: update `docs/STANDALONE_MIGRATION.md`.
- Shared visual-system change: update `CURVE_LAB_DESIGN_SYSTEM.md`.
- Numerical or deterministic behavior: update `docs/REFERENCE_FIXTURES.md`.
- Runtime, compatibility, export, or physical-output evidence: append to
  `docs/VERIFICATION_LOG.md`.
- Perceptual judgment or fine-tuning: append to `docs/LISTENING_NOTES.md` with
  source and monitoring conditions when available.

Do not erase meaningful previous values. Record previous value, current value,
reason, listening result, and verification status when known. Mark unavailable
intent as `UNKNOWN`, `TO BE DOCUMENTED`, or `NEEDS LISTENING TEST`; do not invent it.
Link important decisions and verification entries to a version or commit when one
exists. Never mark a listening or physical-speaker result from calculation alone.

## Verification

Scale verification to the change, and distinguish automated checks from actual
listening and physical speaker tests. Relevant checks include:

- initialization and generated sample
- real mono/stereo audio loading and decode failure
- Play/Pause/Stop, Spacebar, natural end, and restart
- Direction/Distance selection and readouts
- Pen/Eraser, empty eraser click, point movement, endpoint protection, modifier erase
- Clear Current and Reset All confirmation/cancel
- waveform, playhead, scales, Spatial View, and responsive Canvas coordinates
- Distance Bypass
- Stereo, Quad, and Octo render channel count, length, peak, and channel order
- JavaScript syntax, browser console, served HTTP responses, and dependencies

GitHub commit, push, and public deployment require an explicit user request.

## Identity Pilot

Use canonical Hub v0.10 Space #A982FF and its three-orbit/three-point icon.
See `docs/IDENTITY_PILOT.md`; preserve parameter colors and spatial mappings.
