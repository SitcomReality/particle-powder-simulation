export class ColorMapper {
  constructor() {
    this.colorMap = new Map();
  }

  setMapping(color, properties) {
    this.colorMap.set(color, properties);
  }

  getProperties(color) {
    return this.colorMap.get(color) || this.generatePropertiesFromColor(color);
  }

  generatePropertiesFromColor(color) {
    const rgb = this.hexToRgb(color);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Determine type based on lightness and saturation
    let type = 'powder';
    let density = 1.0;
    let dispersion = 1;

    if (hsl.l > 75) {
      // Very light = gas
      type = 'gas';
      density = 0.1 + (hsl.s / 100) * 0.3;
      dispersion = 3 + Math.floor(hsl.h / 60);
    } else if (hsl.s > 60 && hsl.l > 30 && hsl.l < 75) {
      // Saturated mid-tones = liquid
      type = 'liquid';
      density = 0.8 + (hsl.l / 100) * 0.4;
      dispersion = 2 + Math.floor(hsl.h / 120);
    } else if (hsl.l < 30 || (hsl.s < 30 && hsl.l > 40)) {
      // Dark or desaturated = solid
      type = 'solid';
      density = 2.0 + (1 - hsl.l / 100) * 1.0;
      dispersion = 0;
    } else {
      // Default powder
      type = 'powder';
      density = 1.0 + (1 - hsl.l / 100) * 0.8;
      dispersion = 1;
    }

    return { type, density, dispersion };
  }

  mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: h * 360,
      s: s * 100,
      l: l * 100
    };
  }

  randomizeMapping(colors) {
    this.colorMap.clear();

    const types = ['powder', 'liquid', 'gas', 'solid'];
    
    for (const color of colors) {
      const type = types[Math.floor(Math.random() * types.length)];
      
      const properties = {
        type,
        density: type === 'gas' ? 0.1 + Math.random() * 0.4 :
                type === 'liquid' ? 0.8 + Math.random() * 0.5 :
                type === 'solid' ? 2.0 + Math.random() * 1.5 :
                1.0 + Math.random() * 1.0,
        dispersion: type === 'gas' ? 3 + Math.floor(Math.random() * 4) :
                   type === 'liquid' ? 2 + Math.floor(Math.random() * 3) :
                   type === 'solid' ? 0 :
                   Math.floor(Math.random() * 2)
      };

      this.colorMap.set(color, properties);
    }
  }

  toJSON() {
    return Array.from(this.colorMap.entries());
  }

  fromJSON(data) {
    this.colorMap.clear();
    for (const [color, properties] of data) {
      this.colorMap.set(color, properties);
    }
  }
}