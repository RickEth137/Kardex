const fs = require('fs');
const path = require('path');

// Make sure the icons directory exists
const iconsDir = path.join(__dirname, 'build', 'icons');
if (!fs.existsSync(iconsDir)) {
  console.log(`Creating directory: ${iconsDir}`);
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a minimal PNG file with a solid color
function createSimplePNG(width, height, r, g, b, outputPath) {
  // PNG header
  const header = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  // PNG signature
    0x00, 0x00, 0x00, 0x0D,  // IHDR chunk length
    0x49, 0x48, 0x44, 0x52,  // "IHDR" chunk type
    (width >> 24) & 0xFF, (width >> 16) & 0xFF, (width >> 8) & 0xFF, width & 0xFF,  // width
    (height >> 24) & 0xFF, (height >> 16) & 0xFF, (height >> 8) & 0xFF, height & 0xFF,  // height
    0x08,  // bit depth
    0x06,  // color type (RGBA)
    0x00,  // compression method
    0x00,  // filter method
    0x00   // interlace method
  ]);
  
  // CRC for the IHDR chunk
  const crcIHDR = Buffer.from([0x6A, 0x70, 0x9C, 0x26]);
  
  // Create the pixel data (RGBA for each pixel)
  const dataSize = width * height * 4;
  const dataChunk = Buffer.alloc(dataSize);
  
  for (let i = 0; i < dataSize; i += 4) {
    dataChunk[i] = r;      // R
    dataChunk[i + 1] = g;  // G
    dataChunk[i + 2] = b;  // B
    dataChunk[i + 3] = 255;  // A (fully opaque)
  }
  
  // IDAT chunk header
  const idatHeader = Buffer.alloc(8);
  idatHeader.writeUInt32BE(dataSize, 0);  // length
  idatHeader.write('IDAT', 4);            // chunk type
  
  // Very basic CRC calculation for IDAT (this is just a placeholder)
  const crcIDAT = Buffer.from([0x00, 0x00, 0x00, 0x00]);
  
  // IEND chunk (marks the end of the PNG)
  const iend = Buffer.from([
    0x00, 0x00, 0x00, 0x00,  // length (0)
    0x49, 0x45, 0x4E, 0x44,  // "IEND"
    0xAE, 0x42, 0x60, 0x82   // CRC for IEND
  ]);
  
  // Combine all parts into a single buffer
  const pngData = Buffer.concat([
    header, crcIHDR,
    idatHeader, dataChunk, crcIDAT,
    iend
  ]);
  
  fs.writeFileSync(outputPath, pngData);
  console.log(`Created icon: ${outputPath} (${width}x${height})`);
}

// Create icons in three different sizes with the color #4285f4 (Google blue)
createSimplePNG(16, 16, 66, 133, 244, path.join(iconsDir, 'icon16.png'));
createSimplePNG(48, 48, 66, 133, 244, path.join(iconsDir, 'icon48.png'));
createSimplePNG(128, 128, 66, 133, 244, path.join(iconsDir, 'icon128.png'));

console.log('All icons created successfully!');
