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

    return {
      gravity: this.mapRange(hsl.l, 0, 100, 0.8, 0.1),
      friction: this.mapRange(hsl.s, 0, 100, 0.95, 0.99),
      bounciness: this.mapRange(hsl.h, 0, 360, 0.1, 0.8),
      slipperiness: this.mapRange(rgb.g, 0, 255, 0.2, 0.9),
      density: this.mapRange(rgb.b, 0, 255, 0.5, 2.0),
      inertiaResistance: this.mapRange(hsl.l, 0, 100, 0.3, 0.05),
      type: this.determineType(hsl),
      liquid: hsl.s > 50 && hsl.l > 40 && hsl.l < 70,
      gas: hsl.l > 80
    };
  }

  determineType(hsl) {
    if (hsl.l > 80) return 'gas';
    if (hsl.s > 50 && hsl.l > 40 && hsl.l < 70) return 'liquid';
    return 'powder';
  }

  mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
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

    for (const color of colors) {
      const properties = {
        gravity: Math.random() * 1.0 - 0.2,
        friction: 0.9 + Math.random() * 0.09,
        bounciness: Math.random() * 0.8,
        slipperiness: Math.random(),
        density: 0.5 + Math.random() * 1.5,
        inertiaResistance: Math.random() * 0.3,
        type: ['powder', 'liquid', 'gas'][Math.floor(Math.random() * 3)],
        liquid: Math.random() > 0.7,
        gas: Math.random() > 0.9
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