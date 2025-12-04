import { Simulation } from './src/core/Simulation.js';
import { Renderer } from './src/rendering/Renderer.js';
import { ColorMapper } from './src/presets/ColorMapper.js';
import { PresetManager } from './src/presets/PresetManager.js';
import { ImageLoader } from './src/utils/ImageLoader.js';
import { Controls } from './src/ui/Controls.js';

class App {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.renderer = new Renderer(this.canvas);
    
    this.resize();
    
    this.simulation = new Simulation(
      this.canvas.width / this.renderer.pixelRatio,
      this.canvas.height / this.renderer.pixelRatio,
      8
    );
    
    this.colorMapper = new ColorMapper();
    this.presetManager = new PresetManager();
    this.imageLoader = new ImageLoader(this.colorMapper);
    this.controls = new Controls(
      this.simulation,
      this.presetManager,
      this.colorMapper,
      this.imageLoader
    );
    
    // Load default preset
    const defaultPreset = this.presetManager.getPreset('Mixed');
    if (defaultPreset) {
      this.colorMapper.fromJSON(defaultPreset);
    }
    
    this.lastTime = performance.now();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.resize(width, height);
    
    if (this.simulation) {
      this.simulation.resize(
        width / this.renderer.pixelRatio,
        height / this.renderer.pixelRatio
      );
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    
    this.simulation.update(dt);
    this.renderer.render(this.simulation.particles);
  }
}

new App();

