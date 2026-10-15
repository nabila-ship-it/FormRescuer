import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const toCrc = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, toCrc, crc]);
}

function createPng(size) {
  const width = size;
  const height = size;
  
  // Create scanlines: each line has 1 filter byte (0) + width * 4 bytes (RGBA)
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(rowLength * height);

  const center = size / 2;
  const radius = size * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Rounded rectangle shield background
      // Gradient from vibrant Indigo/Blue (37, 99, 235) to Emerald/Teal (16, 185, 129)
      const gradRatio = (x + y) / (width + height);
      const r = Math.round(37 * (1 - gradRatio) + 16 * gradRatio);
      const g = Math.round(99 * (1 - gradRatio) + 185 * gradRatio);
      const b = Math.round(235 * (1 - gradRatio) + 129 * gradRatio);

      // Rounded square check
      const cornerR = size * 0.22;
      const innerX = Math.max(0, Math.abs(dx) - (center - cornerR - 2));
      const innerY = Math.max(0, Math.abs(dy) - (center - cornerR - 2));
      const cornerDist = Math.sqrt(innerX * innerX + innerY * innerY);

      if (cornerDist <= cornerR) {
        // Inside icon background
        // Draw a rescue/floppy/pen checkmark in white
        // White checkmark:
        const nx = x / size;
        const ny = y / size;

        // Document with checkmark or rescue lifebuoy / shield
        const isDoc = (nx >= 0.26 && nx <= 0.74 && ny >= 0.22 && ny <= 0.78);
        const isCheck = (
          (nx >= 0.35 && nx <= 0.48 && Math.abs(ny - (0.55 + (nx - 0.42))) < 0.08) ||
          (nx >= 0.45 && nx <= 0.68 && Math.abs(ny - (0.55 - (nx - 0.42))) < 0.08)
        );

        if (isDoc && !isCheck) {
          // Document background (subtle white with high opacity)
          rawData[pxOffset] = 255;
          rawData[pxOffset + 1] = 255;
          rawData[pxOffset + 2] = 255;
          rawData[pxOffset + 3] = 230;
        } else if (isCheck) {
          // Checkmark (vibrant emerald green)
          rawData[pxOffset] = 16;
          rawData[pxOffset + 1] = 185;
          rawData[pxOffset + 2] = 129;
          rawData[pxOffset + 3] = 255;
        } else {
          // Gradient background
          rawData[pxOffset] = r;
          rawData[pxOffset + 1] = g;
          rawData[pxOffset + 2] = b;
          rawData[pxOffset + 3] = 255;
        }
      } else {
        // Transparent
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
      }
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve(__dirname, '../public/icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

[16, 48, 128].forEach((size) => {
  const png = createPng(size);
  const filePath = path.join(outDir, `icon${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`Generated: ${filePath}`);
});
