# Space reverb proposal — 2026-10-14

Status: PROPOSED; no DSP implementation yet. User requests reverb and advice on independent versus Distance-linked control.

Recommend an independent Reverb section with Amount and Decay, plus an optional Link to Distance. Direction and Distance remain principal spatial curves; Reverb Amount may become a third curve while Decay remains a static room setting initially. Avoid two simultaneous hidden reverb engines: the existing Distance room contribution must be incorporated into the chosen unified room engine. Independent mode supports near/wet and far/dry sound. Link mode shapes the same room send from Distance, not an extra serial reverb. Exact mapping, defaults, gain limits, tail policy and multichannel diffusion remain to be specified and measured.

Distance Bypass currently bypasses attenuation, filtering and room together while preserving Direction. It has comparison value, but the label obscures its scope. Recommend a positive Distance on/off control that preserves its curve; an independent Reverb on/off remains separate. This is a proposed semantic change: existing bypass behavior must not silently change until implemented and documented together.

Implementation order: establish a shared Preview/Render room and distance-filter contract, implement bounded independent controls, verify stability/levels/tail and 2/4/8ch routing, then listening evaluation. Preserve existing engine as comparison baseline. Do not select decay ranges or presets solely by taste.


Update: user approved direction. First local implementation and measured limits are in REVERB_IMPLEMENTATION_2026-10-14.md; the proposed Amount curve remains deferred.
