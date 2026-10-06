// Original procedural Milo effects. No sampled recordings or third-party melodies.
// Reproducible, mono 16-bit PCM WAV, bundled locally for web/iOS/Android.
const fs = require('node:fs');
const path = require('node:path');
const SAMPLE_RATE = 22050;
const EFFECTS = {
  tap: { duration: 0.10, notes: [{ at: 0, length: 0.09, hz: 510, slide: 170 }] },
  confirm: { duration: 0.24, notes: [{ at: 0, length: 0.12, hz: 580 }, { at: 0.09, length: 0.13, hz: 760 }] },
  complete: { duration: 0.51, notes: [{ at: 0, length: 0.17, hz: 510 }, { at: 0.13, length: 0.19, hz: 680 }, { at: 0.27, length: 0.22, hz: 850 }] },
};
function makeWave(effect) {
  const frames = Math.ceil(effect.duration * SAMPLE_RATE);
  const bytes = Buffer.alloc(44 + frames * 2);
  bytes.write('RIFF', 0); bytes.writeUInt32LE(bytes.length - 8, 4); bytes.write('WAVEfmt ', 8);
  bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(SAMPLE_RATE, 24); bytes.writeUInt32LE(SAMPLE_RATE * 2, 28);
  bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34); bytes.write('data', 36); bytes.writeUInt32LE(frames * 2, 40);
  for (let i = 0; i < frames; i++) {
    const time = i / SAMPLE_RATE;
    let sample = 0;
    for (const note of effect.notes) {
      const local = time - note.at;
      if (local < 0 || local >= note.length) continue;
      const progress = local / note.length;
      const envelope = Math.min(1, local / 0.007) * (1 - progress) ** 2;
      const phase = 2 * Math.PI * (note.hz * local + (note.slide || 0) * local * local / (2 * note.length));
      sample += envelope * (Math.sin(phase) * 0.32 + Math.sin(phase * 2) * 0.035);
    }
    bytes.writeInt16LE(Math.round(Math.max(-0.8, Math.min(0.8, sample)) * 32767), 44 + i * 2);
  }
  return bytes;
}
if (require.main === module) {
  const output = path.resolve(__dirname, '../mobile/assets/audio');
  fs.mkdirSync(output, { recursive: true });
  for (const [name, effect] of Object.entries(EFFECTS)) {
    const file = path.join(output, `${name}.wav`);
    fs.writeFileSync(file, makeWave(effect));
    process.stdout.write(`${name}.wav: ${effect.duration}s\n`);
  }
}
module.exports = { EFFECTS, makeWave, SAMPLE_RATE };
