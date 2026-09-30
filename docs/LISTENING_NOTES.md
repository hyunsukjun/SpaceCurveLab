# Listening Notes

This file records perceptual evidence rather than implementation claims. Do not
promote an observation to an approved sonic rule unless the source, monitoring
conditions, comparison, and remaining uncertainty are recorded.

## Listening Entry Template

```text
Date:
Version/commit:
Listener:
Environment: room and background-noise notes
Monitoring: headphones/speakers, audio interface, level or calibration
Source: filename, musical character, duration, channels, sample rate
Curves/settings:
Comparison:
Observation:
Decision:
Confidence: low / medium / high
Standalone requirement:
Follow-up:
```

## Reconstructed Product Observations

These observations come from product discussion. Monitoring conditions and source
identities were not recorded, so they are useful design history but not controlled
reference tests.

### 2026-09-27 - Distance Room Response

- **Earlier behavior:** an equal-power dry/wet response with maximum amount `0.65`,
  later increased to `1.0`
- **Observation:** most audible room change appeared near Far; the first half of the
  Distance curve was difficult to perceive, and the lower maximum was insufficient
- **Resulting decision:** retain the direct path and use a linear room amount from
  `0` at Near to `1` at Far; Preview applies `0.4 * distance` to its convolution send
- **Confidence:** medium for product direction, low for cross-system calibration
- **Standalone requirement:** preserve the more evenly legible macro response first;
  native DSP components may differ if controlled A/B listening approves the result

### 2026-09 - Headphone Spatial Impression

- **Observation:** horizontal motion in the browser headphone Preview was described
  as plausible
- **Unknowns:** source, headphones, level, browser HRTF implementation, curve shape,
  and direct comparison with the rendered stereo file
- **Confidence:** low
- **Standalone requirement:** do not claim parity with the browser HRTF from this
  observation alone; capture controlled web/native comparisons before freezing it

## Required Reference Sessions

- slow, medium, and rapid Direction movement on sustained and transient sources
- Distance at `0`, `0.25`, `0.5`, `0.75`, and `1` with bypass comparison
- mono point source versus stereo linked pair at `-45/+45 degrees`
- Preview versus Stereo Render on at least two headphone models
- Quad and Octo clockwise motion, corner holds, center transitions, and level balance
- source ending with room activity to decide tail truncation policy
- hot mastered input to assess realtime clipping and offline peak attenuation
