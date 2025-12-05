export class ColorMapper {
  constructor() {
    // Store preset as a spectral heuristic instead of individual color mappings
    this.preset = this.createDefaultPreset();
  }

  createDefaultPreset() {
    return {
      // Thresholds for type classification based on HSL
      gasLightnessMin: 75,
      liquidSaturationMin: 60,
      liquidLightnessMin: 30,
      liquidLightnessMax: 75,
      solidLightnessMax: 30,
      solidSaturationMax: 30,
      solidLightnessMin: 40,
      
      // Density ranges for each type
      gasDensityMin: 0.1,
      gasDensityMax: 0.4,
      liquidDensityMin: 0.8,
      liquidDensityMax: 1.3,
      solidDensityMin: 2.0,
      solidDensityMax: 3.5,
      powderDensityMin: 1.0,
      powderDensityMax: 1.8,
      
      // Dispersion ranges
      gasDispersionMin: 3,
      gasDispersionMax: 7,
      liquidDispersionMin: 2,
      liquidDispersionMax: 4,
      powderDispersionMin: 0,
      powderDispersionMax: 1,
      
      // Modulation - how much hue/saturation affect properties
      hueModulation: 0.3,
      saturationModulation: 0.2
    };
  }

  getProperties(color) {
    const rgb = this.hexToRgb(color);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    const p = this.preset;
    
    // Determine type based on thresholds
    let type = 'powder';
    if (hsl.l >= p.gasLightnessMin) {
      type = 'gas';
    } else if (hsl.s >= p.liquidSaturationMin && 
               hsl.l >= p.liquidLightnessMin && 
               hsl.l < p.liquidLightnessMax) {
      type = 'liquid';
    } else if (hsl.l < p.solidLightnessMax || 
               (hsl.s < p.solidSaturationMax && hsl.l >= p.solidLightnessMin)) {
      type = 'solid';
    }
    
    // Calculate properties with modulation based on hue and saturation
    const hueNorm = hsl.h / 360; // 0-1
    const satNorm = hsl.s / 100; // 0-1
    const lightNorm = hsl.l / 100; // 0-1
    
    let density, dispersion;
    
    if (type === 'gas') {
      const range = p.gasDensityMax - p.gasDensityMin;
      density = p.gasDensityMin + range * (satNorm * p.saturationModulation + lightNorm * (1 - p.saturationModulation));
      
      const dispRange = p.gasDispersionMax - p.gasDispersionMin;
      dispersion = Math.floor(p.gasDispersionMin + dispRange * (hueNorm * p.hueModulation + (1 - lightNorm) * (1 - p.hueModulation)));
    } else if (type === 'liquid') {
      const range = p.liquidDensityMax - p.liquidDensityMin;
      density = p.liquidDensityMin + range * lightNorm;
      
      const dispRange = p.liquidDispersionMax - p.liquidDispersionMin;
      dispersion = Math.floor(p.liquidDispersionMin + dispRange * (0.5 + hueNorm * p.hueModulation));
    } else if (type === 'solid') {
      const range = p.solidDensityMax - p.solidDensityMin;
      density = p.solidDensityMin + range * (1 - lightNorm);
      dispersion = 0;
    } else { // powder
      const range = p.powderDensityMax - p.powderDensityMin;
      density = p.powderDensityMin + range * (1 - lightNorm);
      
      const dispRange = p.powderDispersionMax - p.powderDispersionMin;
      dispersion = Math.floor(p.powderDispersionMin + dispRange * satNorm);
    }
    
    return { type, density, dispersion };
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

  randomizeMapping() {
    // Randomize the spectral heuristic thresholds and parameters
    this.preset = {
      gasLightnessMin: 60 + Math.random() * 25,
      liquidSaturationMin: 40 + Math.random() * 40,
      liquidLightnessMin: 20 + Math.random() * 20,
      liquidLightnessMax: 60 + Math.random() * 25,
      solidLightnessMax: 15 + Math.random() * 25,
      solidSaturationMax: 20 + Math.random() * 30,
      solidLightnessMin: 35 + Math.random() * 15,
      
      gasDensityMin: 0.05 + Math.random() * 0.15,
      gasDensityMax: 0.3 + Math.random() * 0.3,
      liquidDensityMin: 0.6 + Math.random() * 0.4,
      liquidDensityMax: 1.0 + Math.random() * 0.5,
      solidDensityMin: 1.5 + Math.random() * 1.0,
      solidDensityMax: 2.5 + Math.random() * 1.5,
      powderDensityMin: 0.8 + Math.random() * 0.5,
      powderDensityMax: 1.3 + Math.random() * 0.8,
      
      gasDispersionMin: 2 + Math.floor(Math.random() * 3),
      gasDispersionMax: 5 + Math.floor(Math.random() * 4),
      liquidDispersionMin: 1 + Math.floor(Math.random() * 2),
      liquidDispersionMax: 3 + Math.floor(Math.random() * 3),
      powderDispersionMin: 0,
      powderDispersionMax: Math.floor(Math.random() * 2),
      
      hueModulation: 0.1 + Math.random() * 0.4,
      saturationModulation: 0.1 + Math.random() * 0.4
    };
  }

  toJSON() {
    return this.preset;
  }

  fromJSON(preset) {
    this.preset = preset;
  }
}