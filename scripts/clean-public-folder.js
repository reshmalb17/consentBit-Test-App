const fs = require('fs');
const path = require('path');

// Clean public folder before build
// Keeps only essential files: index.html, styles.css, and the assets/ directory structure
const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(publicDir)) {
  console.log('Public directory does not exist, skipping cleanup');
  process.exit(0);
}

const filesToKeep = ['index.html', 'styles.css', 'bundle.js', 'bundle.js.LICENSE.txt'];
const dirsToKeep = ['assets'];

console.log('🧹 Cleaning public folder...');

const files = fs.readdirSync(publicDir);
let cleanedCount = 0;
let cleanedSize = 0;

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  const stat = fs.statSync(filePath);
  
  // Skip directories we want to keep
  if (stat.isDirectory() && dirsToKeep.includes(file)) {
    return;
  }
  
  // Skip files we want to keep
  if (filesToKeep.includes(file)) {
    return;
  }
  
  // Remove all other files (old chunks, old assets, etc.)
  try {
    const size = stat.size;
    fs.unlinkSync(filePath);
    cleanedCount++;
    cleanedSize += size;
  } catch (err) {
    console.error(`Error removing ${file}:`, err.message);
  }
});

// Clean assets directory but keep the folder structure
const assetsDir = path.join(publicDir, 'assets');
if (fs.existsSync(assetsDir)) {
  const assetFiles = fs.readdirSync(assetsDir);
  assetFiles.forEach(file => {
    const assetPath = path.join(assetsDir, file);
    try {
      const stat = fs.statSync(assetPath);
      if (stat.isFile()) {
        const size = stat.size;
        fs.unlinkSync(assetPath);
        cleanedCount++;
        cleanedSize += size;
      }
    } catch (err) {
      // Ignore errors
    }
  });
}

if (cleanedCount > 0) {
  const cleanedMB = (cleanedSize / (1024 * 1024)).toFixed(2);
  console.log(`✓ Cleaned ${cleanedCount} files (${cleanedMB} MB) from public folder`);
} else {
  console.log('✓ Public folder is already clean');
}

