export class PresetManager {
  constructor() {
    this.presets = new Map();
    this.loadFromStorage();
    this.initializeDefaultPresets();
  }

  initializeDefaultPresets() {
    // If our new-style presets are missing, replace whatever is stored
    const hasBalancedSpectrum = this.presets.has('Balanced Spectrum');
    if (!hasBalancedSpectrum) {
      this.presets.clear();

      // Balanced, powder-game-like behavior across the spectrum
      this.savePreset('Balanced Spectrum', {
        gasLightnessMin: 78,
        liquidSaturationMin: 55,
        liquidLightnessMin: 28,
        liquidLightnessMax: 78,
        solidLightnessMax: 28,
        solidSaturationMax: 28,
        solidLightnessMin: 42,

        gasDensityMin: 0.08,
        gasDensityMax: 0.35,
        liquidDensityMin: 0.8,
        liquidDensityMax: 1.2,
        solidDensityMin: 2.0,
        solidDensityMax: 3.5,
        powderDensityMin: 1.0,
        powderDensityMax: 1.7,

        gasDispersionMin: 3,
        gasDispersionMax: 6,
        liquidDispersionMin: 2,
        liquidDispersionMax: 4,
        powderDispersionMin: 0,
        powderDispersionMax: 1,

        hueModulation: 0.25,
        saturationModulation: 0.25
      });

      // Hot colors = fire & smoke, cool/dark = ash & stone
      this.savePreset('Fire & Smoke', {
        gasLightnessMin: 70,
        liquidSaturationMin: 55,
        liquidLightnessMin: 30,
        liquidLightnessMax: 70,
        solidLightnessMax: 32,
        solidSaturationMax: 35,
        solidLightnessMin: 38,

        gasDensityMin: 0.05,
        gasDensityMax: 0.25,
        liquidDensityMin: 0.7,
        liquidDensityMax: 1.1,
        solidDensityMin: 2.2,
        solidDensityMax: 3.8,
        powderDensityMin: 1.1,
        powderDensityMax: 2.0,

        gasDispersionMin: 4,
        gasDispersionMax: 8,
        liquidDispersionMin: 1,
        liquidDispersionMax: 3,
        powderDispersionMin: 0,
        powderDispersionMax: 1,

        // Strong hue modulation so reds/oranges behave differently from blues
        hueModulation: 0.45,
        // Saturation makes bright colors more mobile than dull ones
        saturationModulation: 0.35
      });

      // Highly saturated colors behave like flowing liquids, desaturated become solids/powders
      this.savePreset('Vibrant Fluids', {
        gasLightnessMin: 85,
        liquidSaturationMin: 40,
        liquidLightnessMin: 22,
        liquidLightnessMax: 85,
        solidLightnessMax: 24,
        solidSaturationMax: 18,
        solidLightnessMin: 48,

        gasDensityMin: 0.1,
        gasDensityMax: 0.32,
        liquidDensityMin: 0.7,
        liquidDensityMax: 1.15,
        solidDensityMin: 2.3,
        solidDensityMax: 3.9,
        powderDensityMin: 1.0,
        powderDensityMax: 1.8,

        gasDispersionMin: 2,
        gasDispersionMax: 5,
        liquidDispersionMin: 3,
        liquidDispersionMax: 6,
        powderDispersionMin: 0,
        powderDispersionMax: 1,

        hueModulation: 0.2,
        saturationModulation: 0.4
      });

      // Very dark tones are heavy solids, midtones are powders, bright tones become gentle gases
      this.savePreset('Stone & Sand', {
        gasLightnessMin: 82,
        liquidSaturationMin: 60,
        liquidLightnessMin: 36,
        liquidLightnessMax: 78,
        solidLightnessMax: 36,
        solidSaturationMax: 32,
        solidLightnessMin: 44,

        gasDensityMin: 0.09,
        gasDensityMax: 0.3,
        liquidDensityMin: 0.9,
        liquidDensityMax: 1.3,
        solidDensityMin: 2.4,
        solidDensityMax: 4.2,
        powderDensityMin: 1.2,
        powderDensityMax: 2.1,

        gasDispersionMin: 2,
        gasDispersionMax: 5,
        liquidDispersionMin: 1,
        liquidDispersionMax: 3,
        powderDispersionMin: 0,
        powderDispersionMax: 1,

        hueModulation: 0.2,
        saturationModulation: 0.2
      });

      // Bright neons are very mobile gases, dark saturated colors are dense liquids, greys become sluggish solids
      this.savePreset('Neon Gases', {
        gasLightnessMin: 72,
        liquidSaturationMin: 50,
        liquidLightnessMin: 26,
        liquidLightnessMax: 72,
        solidLightnessMax: 32,
        solidSaturationMax: 22,
        solidLightnessMin: 40,

        gasDensityMin: 0.03,
        gasDensityMax: 0.22,
        liquidDensityMin: 0.9,
        liquidDensityMax: 1.4,
        solidDensityMin: 2.0,
        solidDensityMax: 3.0,
        powderDensityMin: 0.9,
        powderDensityMax: 1.6,

        gasDispersionMin: 5,
        gasDispersionMax: 9,
        liquidDispersionMin: 2,
        liquidDispersionMax: 4,
        powderDispersionMin: 0,
        powderDispersionMax: 1,

        hueModulation: 0.5,
        saturationModulation: 0.35
      });
    }
  }

  savePreset(name, colorMapData) {
    this.presets.set(name, colorMapData);
    this.saveToStorage();
  }

  getPreset(name) {
    return this.presets.get(name);
  }

  deletePreset(name) {
    this.presets.delete(name);
    this.saveToStorage();
  }

  listPresets() {
    return Array.from(this.presets.keys());
  }

  saveToStorage() {
    try {
      const data = {};
      for (const [name, preset] of this.presets.entries()) {
        data[name] = preset;
      }
      localStorage.setItem('particlePresets', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save presets:', e);
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('particlePresets');
      if (data) {
        const parsed = JSON.parse(data);
        for (const [name, preset] of Object.entries(parsed)) {
          this.presets.set(name, preset);
        }
      }
    } catch (e) {
      console.error('Failed to load presets:', e);
    }
  }
}