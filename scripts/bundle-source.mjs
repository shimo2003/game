import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const downloadsDir = path.join(publicDir, 'downloads');

if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

const zip = new JSZip();

function addFilesRecursively(dirPath, zipFolder, baseDir) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(baseDir, fullPath);

    // Skip node_modules, dist, .git, and existing zips/tars
    if (
      entry.name === 'node_modules' ||
      entry.name === 'dist' ||
      entry.name === '.git' ||
      entry.name === '.aistudio' ||
      entry.name.endsWith('.zip') ||
      entry.name.endsWith('.tar.gz')
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      addFilesRecursively(fullPath, zipFolder, baseDir);
    } else if (entry.isFile()) {
      const data = fs.readFileSync(fullPath);
      zipFolder.file(relPath, data);
    }
  }
}

// Add src/
addFilesRecursively(path.join(rootDir, 'src'), zip, rootDir);

// Add public/ (excluding downloads dir)
const publicEntries = fs.readdirSync(publicDir, { withFileTypes: true });
for (const entry of publicEntries) {
  if (entry.name === 'downloads' || entry.name.endsWith('.zip') || entry.name.endsWith('.tar.gz')) continue;
  const fullPath = path.join(publicDir, entry.name);
  if (entry.isDirectory()) {
    addFilesRecursively(fullPath, zip, rootDir);
  } else if (entry.isFile()) {
    zip.file(path.relative(rootDir, fullPath), fs.readFileSync(fullPath));
  }
}

// Add configuration files
const rootFiles = [
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'index.html',
  'metadata.json',
  '.env.example',
  'README.md',
];

for (const file of rootFiles) {
  const fullPath = path.join(rootDir, file);
  if (fs.existsSync(fullPath)) {
    zip.file(file, fs.readFileSync(fullPath));
  }
}

// Generate the zip files
console.log('Generating ZIP archive...');
const content = await zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 9 },
});

const zipDest1 = path.join(publicDir, 'queen-tomb-of-karnak-source.zip');
const zipDest2 = path.join(downloadsDir, 'queen-tomb-of-karnak-source.zip');

fs.writeFileSync(zipDest1, content);
fs.writeFileSync(zipDest2, content);

console.log(`Successfully created ZIP archive: ${zipDest1} (${(content.length / 1024).toFixed(1)} KB)`);
console.log(`Successfully created ZIP archive: ${zipDest2}`);
