import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

// Function to copy manifest.json to build folder
function copyManifest() {
  return {
    name: 'copy-manifest',
    closeBundle: () => {
      fs.copyFileSync(
        resolve(__dirname, 'manifest.json'),
        resolve(__dirname, 'build', 'manifest.json')
      );
      
      // Create icons directory if it doesn't exist
      if (!fs.existsSync(resolve(__dirname, 'build', 'icons'))) {
        fs.mkdirSync(resolve(__dirname, 'build', 'icons'), { recursive: true });
      }
      
      // Copy icons if they exist
      const iconSizes = ['16', '48', '128'];
      iconSizes.forEach(size => {
        const iconPath = resolve(__dirname, 'icons', `icon${size}.png`);
        if (fs.existsSync(iconPath)) {
          fs.copyFileSync(
            iconPath,
            resolve(__dirname, 'build', 'icons', `icon${size}.png`)
          );
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), copyManifest()],
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        popup: 'index.html',
        background: 'src/background.js'
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
});