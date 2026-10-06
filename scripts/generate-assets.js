const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'mobile', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1x1 transparent PNG buffer
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const pngBuffer = Buffer.from(base64Png, 'base64');

const files = ['favicon.png', 'icon.png', 'splash.png', 'adaptive-icon.png'];

files.forEach((file) => {
  const filePath = path.join(assetsDir, file);
  fs.writeFileSync(filePath, pngBuffer);
  console.log(`Created: ${filePath}`);
});

console.log('All Expo assets generated successfully!');
