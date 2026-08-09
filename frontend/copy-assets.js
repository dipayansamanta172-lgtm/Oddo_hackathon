import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('Landingpage');
const destDir = path.resolve('dist/Landingpage');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  copyDir(srcDir, destDir);
  console.log('Successfully copied Landingpage frames to dist/Landingpage');
} catch (err) {
  console.error('Error copying assets:', err);
}
