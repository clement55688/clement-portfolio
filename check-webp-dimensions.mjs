import fs from 'node:fs';
import path from 'node:path';

const dir = 'c:\\Users\\Clement\\Documents\\ChatGPT\\github profolio\\horse-game\\dist\\catvolution\\cats';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.webp')).sort();

function parseWebP(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF') return 'not RIFF';
  if (buf.toString('ascii', 8, 12) !== 'WEBP') return 'not WEBP';
  let offset = 12;
  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    offset += 8;
    if (id === 'VP8 ') {
      // VP8 payload starts at `offset`. Width/height per WebP spec:
      // byte 3: width_low, byte 4: width_high(6 bits), byte 5: height_low(6 bits), byte 6: height_high
      const w = ((buf[offset + 4] & 0x3f) << 8) | buf[offset + 3];
      const h = ((buf[offset + 5] & 0x3f) << 8) | buf[offset + 6];
      return `${w}x${h} (VP8 at ${offset - 8})`;
    } else if (id === 'VP8L') {
      const w = buf[offset] | (buf[offset + 1] << 8) | ((buf[offset + 2] & 0x3f) << 16);
      const h = buf[offset + 3] | (buf[offset + 4] << 8) | ((buf[offset + 5] & 0x3f) << 16);
      return `${w}x${h} (VP8L at ${offset - 8})`;
    } else if (id === 'VP8X') {
      const w = buf.readUInt32LE(offset + 2) & 0xffffff;
      const h = buf.readUInt32LE(offset + 6) & 0xffffff;
      return `${w}x${h} (VP8X at ${offset - 8})`;
    }
    offset += size;
    if (offset % 2) offset += 1;
  }
  return 'no image chunk';
}

for (const f of files) {
  const buf = fs.readFileSync(path.join(dir, f));
  console.log(f.padEnd(28), parseWebP(buf), `${(buf.length / 1024).toFixed(1)} KB`);
}