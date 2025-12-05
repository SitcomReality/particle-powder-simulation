export class PresetManager {
  constructor() {
    this.presets = new Map();
    this.loadFromStorage();
    this.initializeDefaultPresets();
  }

  initializeDefaultPresets() {
    if (this.presets.size === 0) {
      // Balanced preset
      this.savePreset('Balanced', {
        gasLightnessMin: 75,
        liquidSaturationMin: 60,
        liquidLightnessMin: 30,
        liquidLightnessMax: 75,
        solidLightnessMax: 30,
        solidSaturationMax: 30,
        solidLightnessMin: 40,
        gasDensityMin: 0.1,
        gasDensityMax: 0.4,
        liquidDensityMin: 0.8,
        liquidDensityMax: 1.3,
        solidDensityMin: 2.0,
        solidDensityMax: 3.5,
        powderDensityMin: 1.0,
        powderDensityMax: 1.8,
        gasDispersionMin: 3,
        gasDispersionMax: 7,
        liquidDispersionMin: 2,
        liquidDispersionMax: 4,
        powderDispersionMin: 0,
        powderDispersionMax: 1,
        hueModulation: 0.3,
        saturationModulation: 0.2
      });

      // Light = Gas preset
      this.savePreset('Light Gases', {
        gasLightnessMin: 50,
        liquidSaturationMin: 70,
        liquidLightnessMin: 20,
        liquidLightnessMax: 50,
        solidLightnessMax: 20,
        solidSaturationMax: 25,
        solidLightnessMin: 35,
        gasDensityMin: 0.05,
        gasDensityMax: 0.3,
        liquidDensityMin: 0.9,
        liquidDensityMax: 1.4,
        solidDensityMin: 2.5,
        solidDensityMax: 4.0,
        powderDensityMin: 1.2,
        powderDensityMax: 2.0,
        gasDispersionMin: 4,
        gasDispersionMax: 8,
        liquidDispersionMin: 2,
        liquidDispersionMax: 4,
        powderDispersionMin: 0,
        powderDispersionMax: 1,
        hueModulation: 0.4,
        saturationModulation: 0.3
      });

      // Saturated = Liquid preset
      this.savePreset('Vibrant Liquids', {
        gasLightnessMin: 85,
        liquidSaturationMin: 45,
        liquidLightnessMin: 25,
        liquidLightnessMax: 85,
        solidLightnessMax: 25,
        solidSaturationMax: 20,
        solidLightnessMin: 50,
        gasDensityMin: 0.1,
        gasDensityMax: 0.35,
        liquidDensityMin: 0.7,
        liquidDensityMax: 1.2,
        solidDensityMin: 2.2,
        solidDensityMax: 3.8,
        powderDensityMin: 1.1,
        powderDensityMax: 1.9,
        gasDispersionMin: 3,
        gasDispersionMax: 6,
        liquidDispersionMin: 3,
        liquidDispersionMax: 5,
        powderDispersionMin: 0,
        powderDispersionMax: 1,
        hueModulation: 0.2,
        saturationModulation: 0.3
      });

      // Dark = Solid preset
      this.savePreset('Heavy Solids', {
        gasLightnessMin: 80,
        liquidSaturationMin: 65,
        liquidLightnessMin: 40,
        liquidLightnessMax: 80,
        solidLightnessMax: 40,
        solidSaturationMax: 35,
        solidLightnessMin: 45,
        gasDensityMin: 0.08,
        gasDensityMax: 0.35,
        liquidDensityMin: 0.9,
        liquidDensityMax: 1.4,
        solidDensityMin: 2.0,
        solidDensityMax: 4.5,
        powderDensityMin: 1.3,
        powderDensityMax: 2.2,
        gasDispersionMin: 3,
        gasDispersionMax: 7,
        liquidDispersionMin: 2,
        liquidDispersionMax: 4,
        powderDispersionMin: 0,
        powderDispersionMax: 1,
        hueModulation: 0.25,
        saturationModulation: 0.15
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