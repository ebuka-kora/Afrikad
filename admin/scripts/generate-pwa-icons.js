#!/usr/bin/env node

/**
 * Generate PWA icons from favicon.ico
 * This script requires sharp to be installed: npm install -D sharp
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '../public');
const faviconPath = join(publicDir, 'favicon.ico');

async function generateIcons() {
  if (!existsSync(faviconPath)) {
    console.error('❌ favicon.ico not found in public directory');
    process.exit(1);
  }

  try {
    // Read ICO file and extract the largest image
    const input = sharp(faviconPath);
    const metadata = await input.metadata();
    
    // Generate 192x192 icon
    await input
      .clone()
      .resize(192, 192, { 
        fit: 'contain', 
        background: { r: 255, g: 255, b: 255, alpha: 1 } 
      })
      .png()
      .toFile(join(publicDir, 'pwa-192x192.png'));

    console.log('✅ Generated pwa-192x192.png');

    // Generate 512x512 icon
    await input
      .clone()
      .resize(512, 512, { 
        fit: 'contain', 
        background: { r: 255, g: 255, b: 255, alpha: 1 } 
      })
      .png()
      .toFile(join(publicDir, 'pwa-512x512.png'));

    console.log('✅ Generated pwa-512x512.png');
    console.log('✅ PWA icons generated successfully!');
  } catch (error) {
    // If ICO format fails, try to create simple placeholder icons
    console.warn('⚠️  Could not convert ICO directly, creating placeholder icons...');
    
    try {
      // Create a simple white square with a colored border as placeholder
      const createPlaceholder = async (size, filename) => {
        await sharp({
          create: {
            width: size,
            height: size,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          }
        })
        .composite([{
          input: Buffer.from(`
            <svg width="${size}" height="${size}">
              <rect width="${size}" height="${size}" fill="#ffffff"/>
              <rect x="0" y="0" width="${size}" height="${size}" fill="none" stroke="#3b82f6" stroke-width="${size/20}"/>
              <text x="50%" y="50%" font-family="Arial" font-size="${size/4}" fill="#3b82f6" text-anchor="middle" dominant-baseline="middle">A</text>
            </svg>
          `),
          top: 0,
          left: 0
        }])
        .png()
        .toFile(join(publicDir, filename));
      };

      await createPlaceholder(192, 'pwa-192x192.png');
      await createPlaceholder(512, 'pwa-512x512.png');
      
      console.log('✅ Generated placeholder PWA icons');
      console.log('💡 Replace these with your actual app icons before production');
    } catch (placeholderError) {
      console.error('❌ Error generating icons:', error.message);
      console.log('\n💡 Please manually create these files:');
      console.log('   - public/pwa-192x192.png (192x192 pixels)');
      console.log('   - public/pwa-512x512.png (512x512 pixels)');
      console.log('   You can use online tools like https://realfavicongenerator.net/');
      process.exit(1);
    }
  }
}

generateIcons();
