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

      // Extra control of how lightness affects classification; 0 = neutral
      lightnessTypeJitter: 0,

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
      saturationModulation: 0.2,

      // How strongly lightness vs saturation drive density (0–1, both used)
      lightnessDensityInfluence: 0.5,
      saturationDensityInfluence: 0.5
    };
  }

  getProperties(color) {
    const rgb = this.hexToRgb(color);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    const p = this.preset;

    // Backward-compatible defaults for older presets
    const lightnessTypeJitter = p.lightnessTypeJitter ?? 0;
    const lightnessDensityInfluence = p.lightnessDensityInfluence ?? 0.5;
    const saturationDensityInfluence = p.saturationDensityInfluence ?? 0.5;
    
    // Apply preset-specific lightness jitter so the same color
    // can be classified differently under different presets.
    const effectiveL = Math.max(0, Math.min(100, hsl.l + lightnessTypeJitter));

    // Determine type based on thresholds and effective lightness
    let type = 'powder';
    if (effectiveL >= p.gasLightnessMin) {
      type = 'gas';
    } else if (hsl.s >= p.liquidSaturationMin && 
               effectiveL >= p.liquidLightnessMin && 
               effectiveL < p.liquidLightnessMax) {
      type = 'liquid';
    } else if (effectiveL < p.solidLightnessMax || 
               (hsl.s < p.solidSaturationMax && effectiveL >= p.solidLightnessMin)) {
      type = 'solid';
    }
    
    // Calculate properties with modulation based on hue, saturation and lightness
    const hueNorm = hsl.h / 360; // 0-1
    const satNorm = hsl.s / 100; // 0-1
    const lightNorm = effectiveL / 100; // 0-1

    // Combined factor so presets can change how strongly L vs S matters
    const densityDriver =
      lightNorm * lightnessDensityInfluence +
      satNorm * saturationDensityInfluence;
    
    let density, dispersion;
    
    if (type === 'gas') {
      const range = p.gasDensityMax - p.gasDensityMin;
      density = p.gasDensityMin + range * densityDriver;
      
      const dispRange = p.gasDispersionMax - p.gasDispersionMin;
      dispersion = Math.floor(
        p.gasDispersionMin +
        dispRange * (hueNorm * p.hueModulation + (1 - lightNorm) * (1 - p.hueModulation))
      );
    } else if (type === 'liquid') {
      const range = p.liquidDensityMax - p.liquidDensityMin;
      density = p.liquidDensityMin + range * densityDriver;
      
      const dispRange = p.liquidDispersionMax - p.liquidDispersionMin;
      dispersion = Math.floor(
        p.liquidDispersionMin +
        dispRange * (0.5 + (hueNorm - 0.5) * p.hueModulation)
      );
    } else if (type === 'solid') {
      const range = p.solidDensityMax - p.solidDensityMin;
      density = p.solidDensityMin + range * (1 - densityDriver);
      dispersion = 0;
    } else { // powder
      const range = p.powderDensityMax - p.powderDensityMin;
      density = p.powderDensityMin + range * (1 - densityDriver);
      
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
    // Randomize the spectral heuristic thresholds and parameters.
    // Ranges are deliberately wide so the same color (e.g. white or grey)
    // can change type and behavior significantly between randomizations.
    this.preset = {
      // Classification thresholds
      gasLightnessMin: 50 + Math.random() * 45,          // 50–95
      liquidSaturationMin: 30 + Math.random() * 50,      // 30–80
      liquidLightnessMin: 10 + Math.random() * 30,       // 10–40
      liquidLightnessMax: 50 + Math.random() * 40,       // 50–90
      solidLightnessMax: 5 + Math.random() * 35,         // 5–40
      solidSaturationMax: 5 + Math.random() * 70,        // 5–75
      solidLightnessMin: 20 + Math.random() * 40,        // 20–60

      // How much to shift lightness perception for classification
      lightnessTypeJitter: -20 + Math.random() * 40,     // -20–+20

      // Density ranges for each type
      gasDensityMin: 0.02 + Math.random() * 0.2,
      gasDensityMax: 0.2 + Math.random() * 0.4,
      liquidDensityMin: 0.5 + Math.random() * 0.5,
      liquidDensityMax: 0.9 + Math.random() * 0.7,
      solidDensityMin: 1.4 + Math.random() * 1.4,
      solidDensityMax: 2.4 + Math.random() * 2.0,
      powderDensityMin: 0.6 + Math.random() * 0.7,
      powderDensityMax: 1.1 + Math.random() * 1.1,
      
      // Dispersion ranges
      gasDispersionMin: 2 + Math.floor(Math.random() * 4),   // 2–5
      gasDispersionMax: 4 + Math.floor(Math.random() * 6),   // 4–9
      liquidDispersionMin: 1 + Math.floor(Math.random() * 3),// 1–3
      liquidDispersionMax: 3 + Math.floor(Math.random() * 4),// 3–6
      powderDispersionMin: 0,
      powderDispersionMax: 0 + Math.floor(Math.random() * 3),// 0–2
      
      // Modulation: how hue/saturation affect properties
      hueModulation: 0.1 + Math.random() * 0.5,
      saturationModulation: 0.1 + Math.random() * 0.5,

      // How strongly lightness vs saturation drive density
      lightnessDensityInfluence: 0.2 + Math.random() * 0.6,   // 0.2–0.8
      saturationDensityInfluence: 0.2 + Math.random() * 0.6   // 0.2–0.8
    };
  }

  toJSON() {
    return this.preset;
  }

  fromJSON(preset) {
    this.preset = preset;
  }
}