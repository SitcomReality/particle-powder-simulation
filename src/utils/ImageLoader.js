import { Particle } from '../core/Particle.js';

export class ImageLoader {
  constructor(colorMapper) {
    this.colorMapper = colorMapper;
  }

  async loadImage(file, targetWidth, targetHeight) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const particles = this.imageToParticles(img, targetWidth, targetHeight);
          resolve(particles);
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  imageToParticles(img, targetWidth, targetHeight, sourceRect = null) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Determine source region (full image by default, or a quadrant sub-rect)
    const sx = sourceRect ? sourceRect.sx : 0;
    const sy = sourceRect ? sourceRect.sy : 0;
    const sWidth = sourceRect ? sourceRect.sWidth : img.width;
    const sHeight = sourceRect ? sourceRect.sHeight : img.height;

    // Determine target dimensions for the logical simulation grid
    const maxDim = 400;
    const desiredWidth = targetWidth ? Math.min(targetWidth, maxDim) : maxDim;
    const desiredHeight = targetHeight ? Math.min(targetHeight, maxDim) : maxDim;

    const scale = Math.min(
      1,
      desiredWidth / sWidth,
      desiredHeight / sHeight
    );

    const width = Math.max(1, Math.floor(sWidth * scale));
    const height = Math.max(1, Math.floor(sHeight * scale));
    
    canvas.width = width;
    canvas.height = height;

    // Draw scaled image region; browser will do minimal filtering, preserving color regions reasonably
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const particles = [];
    const colorCache = new Map();
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];
        
        // Skip transparent pixels
        if (a < 128) continue;
        
        const color = this.rgbToHex(r, g, b);
        
        let properties;
        if (colorCache.has(color)) {
          properties = colorCache.get(color);
        } else {
          properties = this.colorMapper.getProperties(color);
          colorCache.set(color, properties);
        }
        
        const particle = new Particle(
          x + Math.random() * 0.5,
          y + Math.random() * 0.5,
          color,
          properties
        );
        
        particles.push(particle);
      }
    }
    
    return particles;
  }

  loadPresetQuadrant(quadrantIndex, targetWidth, targetHeight) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Assume a 2x2 grid; compute quadrant bounds
        const cols = 2;
        const rows = 2;
        const quadWidth = img.width / cols;
        const quadHeight = img.height / rows;

        const row = Math.floor(quadrantIndex / cols);
        const col = quadrantIndex % cols;

        const sx = col * quadWidth;
        const sy = row * quadHeight;

        const particles = this.imageToParticles(
          img,
          targetWidth,
          targetHeight,
          { sx, sy, sWidth: quadWidth, sHeight: quadHeight }
        );
        resolve(particles);
      };
      img.onerror = reject;
      img.src = 'calibrationquadrants.jpg';
    });
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
}