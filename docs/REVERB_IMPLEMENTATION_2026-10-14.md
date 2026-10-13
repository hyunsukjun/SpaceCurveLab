# Independent Space room — local candidate, 2026-10-14

## Decision and scope

User approved independent Reverb with optional Distance linking and asked which engine to use. Implement an original eight-delay Hadamard feedback delay network (FDN), shared by the AudioWorklet and offline renderer. This is a functional prototype, not listening-approved reverb voicing. No external DSP dependency, copied library code or impulse asset.

Theory reference: Schlecht and Habets, On Lossless Feedback Delay Networks, https://arxiv.org/abs/1606.07729 . Orthogonal mixing is used as a lossless prototype; per-line attenuation and passive low-pass damping make this implementation decay. This reference does not certify the sound or parameter choices here.

## Controls

- Reverb enabled by default; Amount 0–100%, default35%. Amount controls wet input send while direct sound is unchanged; it is not a dry/wet crossfade.
- Decay 0.3–4.0 seconds, default1.2. Nominal feedback decay target, not a measured broadband RT60: fixed 6kHz loop damping shortens high-frequency tails.
- Link to Distance defaults on. Effective send = Amount × effective Distance. Off gives independent Amount, including at Near or with Distance Off.
- Distance On replaces the visible inverse Bypass checkbox. The stable hidden distanceBypass state remains inverse to the new positive control. Curves are retained when turned off.
- Reverb Off smoothly mutes wet output and stops input send; existing room state drains internally. Re-enabling may reveal its remaining tail. Seek/restart constructs fresh room state.
- Reset All restores Direction/Distance curves and all new room settings, and enables Distance. Render format is retained.
- Static Amount/Decay controls in this first version; a Reverb curve is not yet implemented.

## Engine boundary

Delay seconds: .0297/.0371/.0411/.0437/.0533/.0613/.0677/.0793, rounded at engine sample rate. Orthogonal normalized 8x8 Hadamard feedback; per-line gain 10^(-3*delaySeconds/Decay); one-pole passive feedback damping at6kHz. Distinct signed L/R input vectors prevent initial stereo mono summation. Input scale sqrt(1-gain^2)/sqrt(8) moderates energy changes with decay. Output uses orthogonal rows and sqrt(2/channelCount) scaling for2/4/8ch.

App Preview routes a wet-only stereo worklet directly to previewMaster in parallel with the existing spatial direct paths. Legacy convolution wet send is zero in this mode. WAV disables the old diffuse sends, adds the same room core once across the output channels, then uses existing boundary fades/global0.98 peak attenuation/24-bit encoding. Render snapshots room settings. Existing null-options offline API retains legacy DSP for baseline comparisons; app always passes new options.

Not full Preview/Render identity: direct HRTF versus stereo/speaker projection, distance filters, master gains and parameter smoothing still differ. Room control automation uses existing display-clock update points; background scheduling remains an open diagnostic item. No new master limiter. Output remains source duration; room tail beyond the endpoint is deliberately not appended and is stated in UI.

## Verification

- tests/reverb-core.mjs:27 impulse cases across44.1/48/96kHz ×0.3/1.2/4s ×2/4/8channels; finite output, anti-phase stereo produces wet energy, peak<1 for impulse fixtures, late energy decays under threshold.
- Actual worklet wrapper against core:12800 stereo frames, error<1e-8. Send/link/off semantics pass.12 exports at maximum Amount/Decay cover2/4/8ch, Distance bypass and linking; headers, lengths and0.98 ceiling pass.
- Existing24 legacy WAV fixtures, resampling and preparation cancellation pass. These legacy checks preserve comparison APIs; they do not establish new room sonic equivalence.
- Browser: default mono sample playback,2-second stereo import, independent room with Distance Off, maximum Decay, natural end, Reset All and actual2/4/8ch downloaded files; saved stereo24-bit WAV re-import and playback also pass; no console errors observed.
- Saved files:48kHz/24-bit,95999 frames from a96000-frame48kHz input (about0.021ms shorter). Same result with Reverb Off. Decode/resampling boundary rounding remains to localize; new offline core fixture lengths are exact. Do not claim exact source-frame preservation from this browser check.
- Browser engine/physical speakers/long-session performance and comparative listening remain unverified. No Space commit or public release in this step.
