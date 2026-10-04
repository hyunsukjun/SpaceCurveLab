# Space identity pilot

2026-10-04 · Space-only identity pilot. User authorized commit and GitHub/Pages publication on 2026-10-04; deployment verification is reported separately.

Canonical source: `/Users/hyunsukjun/Documents/Codex/2026-09-27/referenced-chatgpt-conversation-this-is-an/outputs/CurveLabHub/DesignIdentity/iterations/2026-10-04-v0.10`.

Header symbol, favicon micro and future app tile are original SVG copies; hashes
are recorded in `assets/identity/palette.json`. Six-color CSS matches Audio/Timbre.

| Lab | sRGB |
| --- | --- |
| Audio | `#459BFF` |
| Timbre | `#F4CB38` |
| Space | `#A982FF` |
| Granular | `#EF4FA4` |
| Spectral | `#FF7047` |
| Oscillator | `#28CDB0` |

## Scope and maintenance

Changes: brand icon/title, favicon, focus/hover, Download WAV accent.
Previous brand #A78BFA and inline waveform are replaced by #A982FF and 3 rings/3 dots.
No JS/DSP, Direction/Distance color, sound object, speaker numbering/channel order,
48kHz/24-bit render, normalized data or interaction changes.
Update palette JSON/CSS and exact source icons with hashes as one versioned set.
Baseline Git d25f9ec can be used for comparison, preserving unrelated later changes.
App tile is a future asset; no native installation or Dock validation.

## Verification

JS syntax passed and every pre-existing JavaScript hash is unchanged.
All 3 SVGs match Hub v0.10 source hashes; each has 3 orbits and 3 dots.
Browser: brand rgb(169,130,255); desktop 1294px, narrow observed 434px with
419px document (no horizontal overflow). Separate default-sample tab verified
Play/time progress and Stop/zero time; no console warnings/errors observed.
Existing user-edited preview tab was preserved. No listening or physical-speaker result is claimed.
