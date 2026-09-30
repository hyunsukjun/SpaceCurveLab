# Space Curve Lab Development Guidelines

Documentation baseline: 2026-09-30 current implementation.

## Product Goal

Space Curve Lab is a focused composition and teaching tool for drawing spatial
motion over audio. It is intentionally smaller than a DAW. The two principal
musical trajectories are cumulative horizontal Direction and perceptual
Distance. Stereo is a headphone/general-listening result; Quad and Octo are
discrete speaker-map outputs.

## Current Architecture

- `index.html`: semantic controls, status readouts, three canvases, reset dialog.
- `src/app.js`: application state, default audio generation, transport, curve
  editing, Preview graph orchestration, Canvas drawing, and download initiation.
- `src/spatial-parameters.js`: shared Distance-to-room-level mapping.
- `src/distance-engine.js`: realtime Distance processor and generated room impulse.
- `src/offline-render.js`: Stereo/Quad/Octo sample processing and WAV encoding.
- `src/render-preparation.js`: fixed-48 kHz offline input preparation.
- `src/speaker-layout.js`: stable discrete speaker channel/angle definitions.
- `src/styles.css`: Curve Lab design tokens, layout, states, and responsive rules.
- `src/eraser-cursor.svg`: local cursor asset.

There is no framework, build step, server component, package manager, external
font, or runtime dependency. ES modules require the files to be served over HTTP.

## State And Data

- Audio input is an in-memory `AudioBuffer`.
- Each curve is an ordered array of normalized `{x, y}` points.
- `x` is normalized time `0..1`; `y` is normalized parameter value `0..1`.
- Direction converts normalized `y` to `-1800..+1800` degrees.
- Distance uses normalized `y` directly as `0..1`.
- Endpoints remain at `x=0` and `x=1`; their values may move.
- No preset, persistence, undo/redo, or schema-versioned state exists yet.

Canvas pixels are only a view and input surface. Resize or pixel density must
never alter normalized musical data.

## Parameter And Curve Policy

- Treat `direction`, `distance`, `distanceBypass`, and `renderFormat` as stable IDs.
- Use platform-independent units and normalized mappings in documentation.
- Preserve smoothstep interpolation unless a separately approved musical change
  updates Preview and Render together.
- Do not add public LPF, reverb, stereo-width, orbit, or speaker-layout controls
  merely because internal values exist.

## Audio Processing Separation

Realtime Preview and offline Render may use different platform mechanisms, but
must consume the same curve data and parameter mapping. Shared mapping belongs in
small pure modules such as `spatial-parameters.js`. A shared function is useful
only when it preserves the intended sound; code reuse is not a reason to lower
offline quality or conceal a known Preview/Render difference.

## Preview And Render

- Preview uses browser `PannerNode` HRTF and `ConvolverNode`.
- Render uses deterministic internal panning, filtering, delay tanks, and PCM
  encoding so multichannel files do not depend on browser output-channel support.
- Differences must remain explicit in `docs/DSP_BEHAVIOR.md`.
- Quad and Octo must be verified on their intended physical speaker systems;
  headphone Preview is not proof of discrete speaker behavior.

## File Loading And Export

- Files stay local and are decoded through `decodeAudioData`.
- Product input scope is mono/stereo. More-than-two-channel input behavior is not
  a supported contract even if a browser decodes it.
- Default audio is generated deterministically in the browser.
- Render input is prepared at 48 kHz with `OfflineAudioContext`; output duration
  follows the decoded input while frame count becomes `round(duration * 48000)`.
- WAV output is interleaved 24-bit PCM RIFF. Spatial rendering and encoding are
  synchronous and currently run on the main thread after resampling.
- Long multichannel files can require substantial memory; do not claim an exact
  safe duration until measured on target hardware.

## Canvas And Responsive Behavior

- Keep the waveform a compact timeline reference and the curve workspace primary.
- Convert pointer coordinates through the current CSS-to-backing-store scale.
- Preserve the square Spatial View and stable plot margins.
- The current canvases do not explicitly multiply by `devicePixelRatio`; Retina
  sharpness is a known migration and web-quality item, not a reason to alter data.
- Test narrow laptop and wide monitor layouts after visual changes.

## Compatibility And Recovery

- Prefer long-lived browser standards: Canvas 2D, Pointer Events, Web Audio,
  File/Blob, and ES modules.
- Keep the `PannerNode.setPosition` fallback while older implementations matter.
- Resume a suspended `AudioContext` on user playback.
- Avoid browser-specific workarounds unless a verified defect requires one.
- Chrome and Edge are the recommended desktop baseline. Safari, Firefox, Windows
  hardware, and Ctrl-click require explicit physical verification when relevant.

## Performance

- Preview updates on `requestAnimationFrame`; audio parameters use Web Audio
  automation rather than rebuilding the graph every frame.
- The current view redraws the waveform, curves, Spatial View, and meter frequently.
  Chrome with graphics acceleration disabled has shown delayed/stuttering graphics
  while Web Audio remained responsive. This is an observed compatibility risk, not
  evidence of an audio-engine failure; measured optimization is deferred.
- Offline rendering allocates all output channels and reverb buffers in memory.
- Do not introduce blocking analysis or render work without measuring interaction
  impact and documenting the trade-off.

## Testing And Release

Syntax, HTTP 200, and synthetic buffer checks are necessary but not equivalent to
listening, real-file, download, or physical-speaker verification. Record each test
at its actual evidence level in `docs/VERIFICATION_LOG.md`. Record perceptual tuning
in `docs/LISTENING_NOTES.md` and keep deterministic contracts in
`docs/REFERENCE_FIXTURES.md`. Update cache query strings when served assets change.
Do not commit, push, or deploy without explicit approval.
