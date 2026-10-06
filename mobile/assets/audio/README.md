# Milo interaction sounds

Three original procedural effects, generated locally by `scripts/create-game-audio.cjs`.
No downloaded samples, voices, copyrighted game sounds or background tracks are included.

| Asset | Purpose | Duration |
|---|---|---:|
| tap.wav | A selection was received | 100 ms |
| confirm.wav | The user confirmed an action | 240 ms |
| complete.wav | A completed result already confirmed by the app | 510 ms |

Format: mono 16-bit PCM WAV, 22,050 Hz. Regenerate with `node scripts/create-game-audio.cjs`.
Version: 1, created 2026-09-27 for this project. The generator is the editable source.
Sound is opt-in and never the only indication of a result. Device loudness and silent-mode behavior require physical-device checking.
