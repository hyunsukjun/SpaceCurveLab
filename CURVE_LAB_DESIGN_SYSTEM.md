# Curve Lab Design System - Space Curve Lab Profile

Baseline: Curve Lab Design System v1.0, applied to Space Curve Lab at commit
`e7b7620` on 2026-09-28.

## Shared Visual Language

- deep navy and charcoal working environment
- brand/header, compact transport, parameter/tool toolbar, thin status strip
- dark Canvas workspace with major/minor grid hierarchy
- muted blue-gray waveform used as a timeline reference
- system font stack; no external font dependency
- consistent control height, border, radius, spacing, hover, focus, and disabled states
- subtle ambient background that does not receive pointer input
- `prefers-reduced-motion` disables ambient and control transitions
- Canvas remains the visually dominant work area

## Identity And Semantic Color

Space Curve Lab brand color is Violet `#A78BFA`. It belongs to the waveform
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
| Brand | `#A78BFA` |
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
  Position, then final L/R output meter. On wide screens the meter receives at
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
- Ambient layers are low-opacity, very slow (`96s` and `118s`), fixed, and
  pointer-transparent. They are decorative and may be removed without changing
  product behavior.

## Protection Rule

Visual refinement must not change normalized curve coordinates, parameter
mapping, DSP, speaker layout, playback, file loading, or export. When the design
system changes, document the reason and verify all interaction states and Canvas
coordinate mapping.
