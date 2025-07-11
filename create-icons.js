const fs = require('fs');
const path = require('path');

// Simple function to create a single-color PNG
function createColorSquare(size, color, outputPath) {
  // PNG header (minimal implementation for a simple color square)
  const header = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // "IHDR" 
    (size >> 24) & 0xFF, (size >> 16) & 0xFF, (size >> 8) & 0xFF, size & 0xFF, // width
    (size >> 24) & 0xFF, (size >> 16) & 0xFF, (size >> 8) & 0xFF, size & 0xFF, // height
    0x08, 0x06, 0x00, 0x00, 0x00 // 8 bits per channel, RGBA, no compression method, no filter method, no interlace method
  ]);

  // Parse the color (assume format #RRGGBB)
  const r = parseInt(color.substring(1, 3), 16);
  const g = parseInt(color.substring(3, 5), 16);
  const b = parseInt(color.substring(5, 7), 16);

  // Create the data chunk with the color
  const dataSize = size * size * 4; // 4 bytes per pixel (RGBA)
  const dataChunk = Buffer.alloc(dataSize);
  
  for (let i = 0; i < dataSize; i += 4) {
    dataChunk[i] = r;     // R
    dataChunk[i+1] = g;   // G
    dataChunk[i+2] = b;   // B
    dataChunk[i+3] = 255; // A (fully opaque)
  }

  // Very simple PNG file (note: this is a minimal implementation)
  fs.writeFileSync(outputPath, Buffer.concat([header, dataChunk]));
  console.log(`Created ${outputPath} (${size}x${size})`);
}

// Ensure icons directory exists
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Create icons of different sizes
const color = '#4285f4'; // Google blue
createColorSquare(16, color, path.join(iconsDir, 'icon16.png'));
createColorSquare(48, color, path.join(iconsDir, 'icon48.png'));
createColorSquare(128, color, path.join(iconsDir, 'icon128.png'));
