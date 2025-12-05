export class PresetManager {
  constructor() {
    this.presets = new Map();
    this.loadFromStorage();
    this.initializeDefaultPresets();
  }

  initializeDefaultPresets() {
    if (this.presets.size === 0) {
      // Sand preset
      this.savePreset('Sand', [
        ['#c2b280', { type: 'powder', density: 1.4, dispersion: 1 }],
        ['#d4a574', { type: 'powder', density: 1.3, dispersion: 1 }],
        ['#8b7355', { type: 'powder', density: 1.6, dispersion: 0 }]
      ]);

      // Water preset
      this.savePreset('Water', [
        ['#4a90e2', { type: 'liquid', density: 1.0, dispersion: 3 }],
        ['#5ca3f5', { type: 'liquid', density: 0.95, dispersion: 3 }],
        ['#3d7bc7', { type: 'liquid', density: 1.05, dispersion: 2 }]
      ]);

      // Gas preset
      this.savePreset('Gas', [
        ['#ff4500', { type: 'gas', density: 0.2, dispersion: 5 }],
        ['#ff6347', { type: 'gas', density: 0.15, dispersion: 4 }],
        ['#ffa500', { type: 'gas', density: 0.3, dispersion: 4 }]
      ]);

      // Mixed preset
      this.savePreset('Mixed', [
        ['#c2b280', { type: 'powder', density: 1.4, dispersion: 1 }],
        ['#4a90e2', { type: 'liquid', density: 1.0, dispersion: 3 }],
        ['#228b22', { type: 'powder', density: 1.7, dispersion: 0 }],
        ['#ff4500', { type: 'gas', density: 0.2, dispersion: 5 }],
        ['#8b4513', { type: 'solid', density: 3.0, dispersion: 0 }]
      ]);

      // Palette-based preset
      this.savePreset('Palette Mix', [
        ['#ff4b4b', { type: 'powder', density: 1.3, dispersion: 1 }],
        ['#ffb74b', { type: 'powder', density: 1.5, dispersion: 1 }],
        ['#ffe54b', { type: 'powder', density: 1.2, dispersion: 1 }],
        ['#4bff85', { type: 'liquid', density: 0.9, dispersion: 3 }],
        ['#4be0ff', { type: 'liquid', density: 1.0, dispersion: 3 }],
        ['#4b6bff', { type: 'liquid', density: 1.1, dispersion: 2 }],
        ['#d84bff', { type: 'gas', density: 0.2, dispersion: 5 }],
        ['#f5f5f5', { type: 'gas', density: 0.15, dispersion: 6 }],
        ['#888888', { type: 'solid', density: 2.5, dispersion: 0 }],
        ['#111111', { type: 'solid', density: 3.0, dispersion: 0 }]
      ]);
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