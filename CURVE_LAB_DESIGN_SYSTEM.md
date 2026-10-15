# Curve Lab Design System - Space Curve Lab Profile

Baseline: Curve Lab Design System v1.0, applied to Space Curve Lab at commit
`e7b7620` on 2026-09-28; web skin simplified on 2026-10-02.

## Shared Visual Language

- deep navy and charcoal working environment
- brand/header, compact transport, parameter/tool toolbar, thin status strip
- dark Canvas workspace with major/minor grid hierarchy
- muted blue-gray waveform used as a timeline reference
- system font stack; no external font dependency
- consistent control height, border, radius, spacing, hover, focus, and disabled states
- solid deep background and opaque working surfaces without full-screen blur,
  decorative animation, or layered panel shadows
- Canvas remains the visually dominant work area

## Identity And Semantic Color

Space Curve Lab brand color is Violet `#A982FF`. It belongs to the three-orbit/three-point
brand mark, the `Curve Lab` title text, focus accents, and limited identity details.

Parameter colors are semantic and must not be replaced by the brand color:

- Direction: Cyan `#66D2FF`
- Distance and sound object: Red `#FF4B3E`

The active parameter border/background, curve, points, legend, and related
visualization retain the parameter's color meaning.

## Portable Tokens

The CSS custom properties are the current web representation of portable design
meaning. Standalone implementations should reproduce the role, not necessarily
the CSS name.

| Role | Current value |
| --- | --- |
| Background | `#07111C` |
| Deep background | `#050B12` |
| Raised surface | `#122438` |
| Canvas | `#0C1F31` |
| Border | `#203A52` |
| Strong border | `#345672` |
| Primary text | `#E8F0F6` |
| Secondary text | `#AABCCC` |
| Muted text | `#71889B` |
| Brand | `#A982FF` |
| Focus | `#C4B5FD` |
| Direction | `#66D2FF` |
| Distance | `#FF4B3E` |
| Small/medium/large radius | `4 / 6 / 8 px` |
| Base control height | `38 px` |
| Toolbar minimum height | `54 px` |
| Spacing scale | `4 / 8 / 12 / 16 / 24 px` |

## Space-Specific Composition

- Direction and Distance mode buttons precede the Pen/Eraser segmented tool.
- Distance Bypass, Clear Current, and Reset All remain in the curve toolbar.
- Waveform is short; curve editor is the main work surface.
- Spatial View remains a square secondary view: right side on wide layouts and
  below the curve at widths below `1040px`.
- Status readouts expose input, active curve, point count, current Direction,
  Distance, Preview, selected output engine, and WAV state.
- The bottom playback bar follows the shared order: Play/Stop, sole time display,
  then final L/R output meter. OUTPUT TIME below the curve replaces Position.
  On wide screens the meter receives at
  least about one third of the viewport; narrower layouts wrap it without overlap.

## Interaction States

- Hover raises contrast without shifting layout.
- Keyboard focus uses a visible two-pixel Violet outline.
- Disabled controls retain shape and use reduced opacity.
- Pen/Eraser selected state is expressed by both visual state and `aria-pressed`.
- The eraser uses the local `eraser-cursor.svg` asset with crosshair fallback.

## Responsive And Motion Rules

- `1240px`: header and toolbar reorganize; Spatial View remains beside the curve.
- `1040px`: Spatial View moves below the curve.
- `860px`: single-column header/toolbar and two-column status grid.
- The former fixed ambient layers used `90px` blur with `96s` and `118s`
  animations. They were removed on 2026-10-02 because they were decorative and
  increased compositing work without communicating audio state.
- Control transitions and non-functional panel shadows were removed. Hover,
  focus, disabled, active, curve, waveform, playhead, and meter states remain.
- Layout dimensions and responsive breakpoints are unchanged by the skin
  simplification.

## Protection Rule

Visual refinement must not change normalized curve coordinates, parameter
mapping, DSP, speaker layout, playback, file loading, or export. When the design
system changes, document the reason and verify all interaction states and Canvas
coordinate mapping.

## Hub v0.10 Identity Pilot — 2026-10-04

PROJECT-SPECIFIC local pilot. Previous brand #A78BFA replaced by canonical Space
#A982FF. Header/favicon use exact Hub v0.10 symbol/micro SVGs.
`--cl-accent` aliases `--curve-lab-space` from `assets/identity/tokens.css`.
Hover #BAA1FF and focus #CCB4FF are derived web colors, not extra brand colors.
Download WAV uses a darker accent-derived fill. Direction/Distance, sound object,
meters, spatial geometry and processing are unchanged.
See `docs/IDENTITY_PILOT.md` and `assets/identity/palette.json` for provenance.

## Laptop-First Workspace — 2026-10-05

- The bottom playback bar is fixed inside the viewport. The application reserves
  breakpoint-specific bottom space so the last Spatial View content can scroll
  completely above it.
- Waveform height scales from `88px` to `128px`. The Direction/Distance editor
  uses a Space-specific minimum of `250px` on side-by-side layouts and `300px`
  after Spatial View moves below it; these values are not copied from Timbre.
- At `1366x768` and `1280x800`, Waveform, Curve, Spatial View, Play/Stop, time,
  OUTPUT TIME, and the L/R meter remain immediately available without horizontal
  page overflow.
- Space has no mode-dependent expanding parameter panel. Direction and Distance
  share the same toolbar and Canvas footprint, so switching modes must not move
  the workspace.
- The square Spatial View, speaker markers, numbering, sound-object geometry,
  curve coordinates, and pointer conversion remain implementation-protected.
- Reset All uses the destructive command color while Clear Current remains a
  neutral curve-editing command.


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


## 2026-10-14 — Common Clear Current / Reset All appearance
Both actions follow Audio's neutral navy reference: background #122438, text #aabccc, 6px radius, 13px/620 type, 92px minimum width, 38px height (30px at >=900px viewport width). Clear border #3b5063; Reset border #203a52. Shared hover/pressed/focus/disabled styles live in src/curve-actions.css. Red action emphasis is removed; brand/parameter colors elsewhere stay independent. Existing IDs, handlers, reset scope, confirmation mechanism and keyboard behavior remain unchanged. This is a local visual update, separate from DSP verification.


## 2026-10-14 — Family file information

Approved circular dotted-i disclosure immediately left of Open Audio. Default format guidance moves into this optional panel; privacy and actual error/status notices remain. Space operates disclosure without audio transport; Escape/outside click dismiss. Output guidance: Source duration · 2 / 4 / 8 channels · 48 kHz / 24-bit WAV. Input limits reflect current implementation, not a device-memory guarantee. No DSP, admission, export, IDs or defaults changed.


## 2026-10-14 — Family parameter help

Static parameter descriptions are available on the relevant buttons using the Audio help design; current values, axes and activation feedback remain visible. See `docs/PARAMETER_HELP.md` (or `PARAMETER_HELP.md` in this directory). No DSP or curve mapping changes.


## 2026-10-14 — Open Audio keyboard access
파일 입력을 display:none 대신 시각적으로만 숨겨 Tab과 Enter/Space로 기본 파일 선택기에 접근하도록 수정. 포커스는 기존 fileButton:focus-within 윤곽선으로 표시한다. 파일 디코딩·처리 계약은 변경하지 않는다.


## 2026-10-15 — Studio family visual pilot (local)
Reference: approved Audio design, commit 3e9723b. Apply deep cool-grey surfaces,
high-contrast typography, continuous panel boundaries and framed meters through
src/studio-theme.css. Preserve this Lab's brand accent, effect identities,
parameter mapping, feature layout and audio engine. No JS/DSP change.
This is a local first-pass candidate, not deployed; Canvas-rendered colors remain
the current implementation pending individual visual review. Narrow transport
uses document flow to avoid covering the editor. Listening is not implied.

Pilot smoke evidence: 1422px viewport, no horizontal overflow; default initialization and one parameter/effect selection verified; no browser errors captured. No full audio lifecycle, narrow/zoom certification or listening repeated. Only HTML/CSS/documentation changed.

### 2026-10-15 — Canvas alignment and zoom verification

- Canvas paper `#191C20`; neutral minor/major grid `rgba(139,149,162,.08/.18)`, matching the approved Audio direction. Parameter colors and audio processing are unchanged.
- Local browser: 800 CSS px viewport; actual Brave 125% (952 CSS px, DPR 2.5) and 150% (793 CSS px, DPR 3). No document horizontal overflow in any of the five Labs. Narrow layouts use vertical scrolling.
- Parameter selection and Clear Current smoke passed in all five; no captured console errors. Timbre play/pause/rewind smoke passed.
- Oscillator only: narrow-screen curve minimum height 220 px prevents crowded frequency labels; expanded Synthesis detail remains accessible.
- Syntax, keyboard tests and whitespace checks passed. Evidence: family workspace `evidence/family-studio-zoom-checks-20261015.json` and `*-studio-150-20261015.png`.
- Not a listening approval or a complete Safari/Windows regression. Local changes only; release decision remains pending.
- Additional targeted lifecycle/render regression suites passed; full results in family `UI_DESIGN_FAMILY_CANVAS_2026-10-15.md`.

## Common button states — 2026-10-15

`src/button-states.css` is the identical six-Lab contract, loaded after studio-theme.
Available off/bypassed: Audio reference gradient #363F4B → #2D3540, text #F0F3F7, edge #626C79. Unavailable: #353B44 / #949EAC / #495360 at full opacity. Selected: preserve existing parameter-specific fill, text and border colors, replace text underline with a full-width dark lower inset bevel (3 px). Focus remains independent. No hit-target, state, DSP or timing changes.

### Common role dimensions — 2026-10-15

- Main text buttons: 13px, weight 500, line-height 18px; 4px corner radius.
- Open/Download/Save: 38px high. Parameter/effect/waveform/synthesis mode/chain/action/dialog buttons: 34px.
- Pen/Eraser: 32px with shared 4px outer group; joined inner edges remain square. Transport: 32px, existing 3px corners and CSS glyphs retained.
- Audio edit helpers: 26px, 11px text; zoom symbols 14px. Fade handles are excluded.
- Secondary status text 12px; readout labels 11px, strong values 14px. Parameter colors and state semantics unchanged.
- Verified all six at 1422px and 640px CSS widths: no document horizontal overflow or measured button text clipping. Representative mode switching passed; Timbre Flanger expanded controls inspected, Audio Pen/Eraser and zoom/Fit exercised. Keyboard regression and diff whitespace checks passed.
- This is CSS-only verification, not fresh audio/export or listening certification. Local changes remain unpublished.

## Current precedence
See `docs/SHARED_VISUAL_CONTRACT.md` for the accepted shared baseline and resolution of older pilot conflicts. Newer role/state rules supersede old underline and 30px compact-button guidance.
