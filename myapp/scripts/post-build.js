/**
 * Post-build script for Hostinger deployment
 * Automatically copies .htaccess to dist folder after build
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_HTACCESS = path.join(__dirname, '..', '.htaccess');
const DEST_HTACCESS = path.join(__dirname, '..', 'dist', '.htaccess');

console.log('\n========================================');
console.log('  Post-Build Script');
console.log('========================================\n');

try {
  // Check if .htaccess exists
  if (!fs.existsSync(SOURCE_HTACCESS)) {
    console.log('⚠ Warning: .htaccess file not found');
    console.log('  Creating default .htaccess for React SPA...\n');
    
    const defaultHtaccess = `# React SPA Configuration
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`;
    
    fs.writeFileSync(SOURCE_HTACCESS, defaultHtaccess);
  }
  
  // Copy .htaccess to dist
  fs.copyFileSync(SOURCE_HTACCESS, DEST_HTACCESS);
  console.log('✓ .htaccess copied to dist/');
  
  // Show build statistics
  const distPath = path.join(__dirname, '..', 'dist');
  const files = getAllFiles(distPath);
  const totalSize = files.reduce((sum, file) => sum + fs.statSync(file).size, 0);
  
  console.log(`✓ Build output: ${files.length} files`);
  console.log(`✓ Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('\n✓ Build completed successfully!');
  console.log('\nDeployment-ready files are in: dist/');
  console.log('========================================\n');
  
} catch (error) {
  console.error('✗ Post-build script error:', error.message);
  process.exit(1);
}

// Helper function to get all files recursively
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}
