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
        ['#c2b280', { gravity: 0.5, friction: 0.98, bounciness: 0.1, slipperiness: 0.7, density: 1.2, inertiaResistance: 0.1, type: 'powder' }],
        ['#d4a574', { gravity: 0.5, friction: 0.98, bounciness: 0.1, slipperiness: 0.7, density: 1.2, inertiaResistance: 0.1, type: 'powder' }],
        ['#8b7355', { gravity: 0.6, friction: 0.97, bounciness: 0.05, slipperiness: 0.6, density: 1.4, inertiaResistance: 0.15, type: 'powder' }]
      ]);

      // Water preset
      this.savePreset('Water', [
        ['#4a90e2', { gravity: 0.4, friction: 0.99, bounciness: 0.2, slipperiness: 0.95, density: 1.0, inertiaResistance: 0.05, type: 'liquid', liquid: true }],
        ['#5ca3f5', { gravity: 0.4, friction: 0.99, bounciness: 0.2, slipperiness: 0.95, density: 1.0, inertiaResistance: 0.05, type: 'liquid', liquid: true }],
        ['#3d7bc7', { gravity: 0.4, friction: 0.99, bounciness: 0.2, slipperiness: 0.95, density: 1.0, inertiaResistance: 0.05, type: 'liquid', liquid: true }]
      ]);

      // Fire preset
      this.savePreset('Fire', [
        ['#ff4500', { gravity: -0.3, friction: 0.96, bounciness: 0.5, slipperiness: 0.3, density: 0.5, inertiaResistance: 0.2, type: 'gas', gas: true }],
        ['#ff6347', { gravity: -0.25, friction: 0.96, bounciness: 0.5, slipperiness: 0.3, density: 0.5, inertiaResistance: 0.2, type: 'gas', gas: true }],
        ['#ffa500', { gravity: -0.2, friction: 0.97, bounciness: 0.4, slipperiness: 0.4, density: 0.6, inertiaResistance: 0.15, type: 'gas', gas: true }]
      ]);

      // Mixed preset
      this.savePreset('Mixed', [
        ['#c2b280', { gravity: 0.5, friction: 0.98, bounciness: 0.1, slipperiness: 0.7, density: 1.2, inertiaResistance: 0.1, type: 'powder' }],
        ['#4a90e2', { gravity: 0.4, friction: 0.99, bounciness: 0.2, slipperiness: 0.95, density: 1.0, inertiaResistance: 0.05, type: 'liquid', liquid: true }],
        ['#228b22', { gravity: 0.6, friction: 0.97, bounciness: 0.3, slipperiness: 0.5, density: 1.5, inertiaResistance: 0.2, type: 'powder' }],
        ['#ff4500', { gravity: -0.3, friction: 0.96, bounciness: 0.5, slipperiness: 0.3, density: 0.5, inertiaResistance: 0.2, type: 'gas', gas: true }]
      ]);

      // Palette-based preset matching the drawing color palette
      this.savePreset('Palette Mix', [
        ['#ff4b4b', { gravity: 0.7, friction: 0.96, bounciness: 0.4, slipperiness: 0.4, density: 1.1, inertiaResistance: 0.1, type: 'powder' }],
        ['#ffb74b', { gravity: 0.6, friction: 0.97, bounciness: 0.3, slipperiness: 0.5, density: 1.2, inertiaResistance: 0.12, type: 'powder' }],
        ['#ffe54b', { gravity: 0.4, friction: 0.98, bounciness: 0.6, slipperiness: 0.6, density: 0.9, inertiaResistance: 0.08, type: 'powder' }],
        ['#4bff85', { gravity: 0.5, friction: 0.99, bounciness: 0.2, slipperiness: 0.9, density: 1.0, inertiaResistance: 0.05, type: 'liquid', liquid: true }],
        ['#4be0ff', { gravity: 0.45, friction: 0.99, bounciness: 0.25, slipperiness: 0.95, density: 1.0, inertiaResistance: 0.05, type: 'liquid', liquid: true }],
        ['#4b6bff', { gravity: 0.3, friction: 0.98, bounciness: 0.5, slipperiness: 0.7, density: 0.8, inertiaResistance: 0.07, type: 'liquid', liquid: true }],
        ['#d84bff', { gravity: -0.1, friction: 0.97, bounciness: 0.6, slipperiness: 0.5, density: 0.6, inertiaResistance: 0.15, type: 'gas', gas: true }],
        ['#f5f5f5', { gravity: -0.05, friction: 0.99, bounciness: 0.7, slipperiness: 0.4, density: 0.4, inertiaResistance: 0.2, type: 'gas', gas: true }],
        ['#888888', { gravity: 0.8, friction: 0.95, bounciness: 0.1, slipperiness: 0.3, density: 2.0, inertiaResistance: 0.25, type: 'powder' }],
        ['#111111', { gravity: 0.9, friction: 0.94, bounciness: 0.05, slipperiness: 0.2, density: 2.5, inertiaResistance: 0.3, type: 'powder' }]
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