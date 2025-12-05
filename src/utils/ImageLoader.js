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

  imageToParticles(img, targetWidth, targetHeight) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Determine target dimensions for the logical simulation grid
    const maxDim = 400;
    const desiredWidth = targetWidth ? Math.min(targetWidth, maxDim) : maxDim;
    const desiredHeight = targetHeight ? Math.min(targetHeight, maxDim) : maxDim;

    const scale = Math.min(
      1,
      desiredWidth / img.width,
      desiredHeight / img.height
    );

    const width = Math.max(1, Math.floor(img.width * scale));
    const height = Math.max(1, Math.floor(img.height * scale));
    
    canvas.width = width;
    canvas.height = height;

    // Draw scaled image; browser will do minimal filtering, preserving color regions reasonably
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, width, height);
    
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

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
}