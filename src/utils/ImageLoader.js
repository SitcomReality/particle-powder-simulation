import { Particle } from '../core/Particle.js';

export class ImageLoader {
  constructor(colorMapper) {
    this.colorMapper = colorMapper;
  }

  async loadImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const particles = this.imageToParticles(img);
          resolve(particles);
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  imageToParticles(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Scale down if too large
    const maxDim = 400;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const width = Math.floor(img.width * scale);
    const height = Math.floor(img.height * scale);
    
    canvas.width = width;
    canvas.height = height;
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