# Space Curve Lab

Prototype mode: this is an independent static Web Audio prototype that follows the existing Audio Curve Lab / Timbre Curve Lab file pattern without changing those projects.

## Reused System Language

- Top bar, local-file privacy note, compact transport, readout panel, 6px frame radius, dark surface palette, and canvas-based curve editing follow the earlier Curve Lab tools.
- The identity color is different: Space Curve Lab uses a bright cyan accent, while the sound object and Distance curve use a stronger red.
- The waveform is reduced to a timeline reference lane. The main work area is the two-curve editor plus the square Spatial View.

## v1 Scope

- Input: mono or stereo audio.
- Curves: Direction and Distance only.
- Direction: cumulative rotation angle, center 0, range -1800 to +1800 degrees.
- Distance: 0 Near to 1 Far, with a visible bypass and automatic room depth.
- Preview: headphone simulation with Web Audio `PannerNode`, plus modular distance processing.
- Distance DSP: `GainNode`, gentle `BiquadFilterNode` low-pass, and a small generated convolution room. Distance raises the room send linearly from 0% at Near to 100% at Far while retaining the distance-shaped direct sound.
- Render: Stereo 2ch, Quad 4ch, or Octophonic 8ch WAV from the same Direction/Distance curve data.
- Stereo render is a headphone/general-listening spatial result, not a replacement for discrete speaker playback.
- Speaker numbering: v1 uses the 22.5-degree octophonic square orientation. Channel 1 sits front-left, channel 2 front-right, then 3-8 continue clockwise. Quad view/render labels its four WAV channels directly as 1 front-left, 2 front-right, 3 rear-left, and 4 rear-right.

## Browser and File Notes

- Recommended browser: current Chrome or Edge on desktop.
- Processing is local in the browser. Audio files are not uploaded.
- Short sound files are recommended for the prototype. Very long 4ch/8ch renders can use a lot of memory because WAV files are generated in one pass.
- WAV export is 16-bit PCM RIFF. This is simple and broadly compatible, but not intended for very large multi-hour files.
- Stereo 2ch is a headphone/general-listening spatial render. Quad 4ch and Octo 8ch are discrete speaker-map renders and should be checked on the intended playback system.
- This is an experimental prototype, not a mastering tool or a room-calibrated spatial audio renderer.

## Deliberately Excluded From v1

Elevation, X/Y curves, CW/CCW buttons, rotation-speed controls, Orbit/Spiral parameters, arbitrary speaker layout, Ambisonics, multitrack operation, Live Motion recording, public LPF/Reverb controls, and Stereo Width controls are not exposed.

## Conflict Notes

- Existing Audio Curve Lab and Timbre Curve Lab projects are left untouched.
- The v1 preview uses browser-standard nodes and no external sound assets.
- Offline render uses a lightweight internal panning model so multichannel WAV export can work without adding dependencies. It is designed to be replaceable if the later prototype needs a more advanced spatial renderer.
