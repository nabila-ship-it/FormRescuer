import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

// Helper to copy directory recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Custom plugin for Chrome Extension distribution
function chromeExtensionPlugin() {
  return {
    name: 'chrome-extension-plugin',
    closeBundle() {
      // Copy manifest.json
      const srcManifest = resolve(__dirname, 'public/manifest.json');
      const distManifest = resolve(__dirname, 'dist/manifest.json');
      if (fs.existsSync(srcManifest)) {
        fs.copyFileSync(srcManifest, distManifest);
      }

      // Copy icons
      const srcIconsDir = resolve(__dirname, 'public/icons');
      const distIconsDir = resolve(__dirname, 'dist/icons');
      copyDirSync(srcIconsDir, distIconsDir);

      // Copy demo directory
      const srcDemoDir = resolve(__dirname, 'demo');
      const distDemoDir = resolve(__dirname, 'dist/demo');
      copyDirSync(srcDemoDir, distDemoDir);
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), chromeExtensionPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        content: resolve(__dirname, 'src/content/content.js'),
        background: resolve(__dirname, 'src/background/background.js')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});
