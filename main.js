import { Simulation } from './src/core/Simulation.js';
import { Renderer } from './src/rendering/Renderer.js';
import { ColorMapper } from './src/presets/ColorMapper.js';
import { PresetManager } from './src/presets/PresetManager.js';
import { ImageLoader } from './src/utils/ImageLoader.js';
import { Controls } from './src/ui/Controls.js';
import { Particle } from './src/core/Particle.js';

class App {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.canvasContainer = document.getElementById('canvasContainer');
    this.simScale = 4;
    this.renderer = new Renderer(this.canvas, this.simScale);
    
    this.resize();
    
    this.simulation = new Simulation(
      this.canvas.width / this.renderer.pixelRatio / this.simScale,
      this.canvas.height / this.renderer.pixelRatio / this.simScale
    );
    
    this.colorMapper = new ColorMapper();
    this.presetManager = new PresetManager();
    this.imageLoader = new ImageLoader(this.colorMapper);
    this.controls = new Controls(
      this.simulation,
      this.presetManager,
      this.colorMapper,
      this.imageLoader,
      this.getParticleAtScreen.bind(this) // pass sampling callback
    );
    
    const defaultPreset = this.presetManager.getPreset('Balanced Spectrum');
    if (defaultPreset) {
      this.colorMapper.fromJSON(defaultPreset);
    }
    
    this.drawing = {
      isDrawing: false,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      tool: 'brush'
    };

    this.lastTime = performance.now();
    this.fpsDisplay = document.getElementById('fpsCounter');
    this.frameCounter = 0;
    this.fpsTime = 0;

    this.setupDrawing();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());

    // Start paused and load one of the first three quadrants (Rose, Cyberpunk, Desert)
    this.simulation.setPaused(true);
    const pauseBtn = document.getElementById('pause');
    if (pauseBtn) pauseBtn.textContent = 'Resume';

    // Load a random quadrant among 0 (Rose), 1 (Cyberpunk), 2 (Desert)
    this.loadInitialQuadrant();
  }

  async loadInitialQuadrant() {
    try {
      const choice = [0, 1, 2];
      const idx = choice[Math.floor(Math.random() * choice.length)];
      const particles = await this.imageLoader.loadPresetQuadrant(
        idx,
        this.simulation.width,
        this.simulation.height
      );
      this.simulation.clear();
      this.simulation.addParticles(particles);
      // After loading, ensure particle properties match current color mapping
      this.simulation.remapParticleProperties(this.colorMapper);
    } catch (err) {
      console.error('Failed to load initial quadrant:', err);
    }
  }

  resize() {
    const container = this.canvasContainer || this.canvas.parentElement;
    const rect = container.getBoundingClientRect();

    // Keep the simulation area square based on available space
    const size = Math.floor(Math.min(rect.width, rect.height));
    const width = size;
    const height = size;

    this.renderer.resize(width, height);
    
    if (this.simulation) {
      this.simulation.resize(
        width / this.renderer.pixelRatio / this.simScale,
        height / this.renderer.pixelRatio / this.simScale
      );
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    const now = performance.now();
    const elapsed = now - this.lastTime;
    const dt = Math.min(elapsed / 1000, 0.1);
    this.lastTime = now;

    this.frameCounter++;
    this.fpsTime += elapsed;
    
    if (this.fpsTime >= 1000) {
      const fps = Math.round(this.frameCounter / (this.fpsTime / 1000));
      this.fpsDisplay.textContent = `FPS: ${fps}`;
      this.frameCounter = 0;
      this.fpsTime = 0;
    }
    
    this.simulation.update(dt);
    this.renderer.render(this.simulation.grid);
  }

  setupDrawing() {
    const canvas = this.canvas;

    const getCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / this.simScale);
      const y = Math.floor((e.clientY - rect.top) / this.simScale);
      return { x, y };
    };

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const { x, y } = getCoords(e);
      this.onPointerDown(x, y);
      canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!this.drawing.isDrawing && this.controls.getTool() === 'brush') return;
      const { x, y } = getCoords(e);
      this.onPointerMove(x, y);
    });

    const endDrawing = (e) => {
      if (!this.drawing.isDrawing && this.controls.getTool() !== 'brush') return;
      const { x, y } = getCoords(e);
      this.onPointerUp(x, y);
      if (e.pointerId != null) {
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
    };

    canvas.addEventListener('pointerup', endDrawing);
    canvas.addEventListener('pointercancel', endDrawing);
    canvas.addEventListener('pointerleave', endDrawing);
  }

  onPointerDown(x, y) {
    const tool = this.controls.getTool();
    this.drawing.tool = tool;

    if (tool === 'brush') {
      this.drawing.isDrawing = true;
      this.drawing.lastX = x;
      this.drawing.lastY = y;
      this.stampBrushLine(x, y, x, y);
    } else {
      this.drawing.isDrawing = true;
      this.drawing.startX = x;
      this.drawing.startY = y;
    }
  }

  onPointerMove(x, y) {
    if (!this.drawing.isDrawing) return;
    const tool = this.drawing.tool;

    if (tool === 'brush') {
      const lastX = this.drawing.lastX;
      const lastY = this.drawing.lastY;
      this.stampBrushLine(lastX, lastY, x, y);
      this.drawing.lastX = x;
      this.drawing.lastY = y;
    }
  }

  onPointerUp(x, y) {
    if (!this.drawing.isDrawing) return;
    const tool = this.drawing.tool;

    if (tool === 'line') {
      this.drawLine(this.drawing.startX, this.drawing.startY, x, y);
    } else if (tool === 'rect') {
      this.drawRect(this.drawing.startX, this.drawing.startY, x, y);
    }

    this.drawing.isDrawing = false;
  }

  createParticleAt(x, y, color) {
    const props = this.colorMapper.getProperties(color);
    const p = new Particle(x, y, color, props);
    this.simulation.addParticle(p);
  }

  stampBrushAt(x, y) {
    const size = this.controls.getBrushSize();
    const radius = size / 2;
    const color = this.controls.getColor();
    const r2 = radius * radius;

    const startX = Math.floor(x - radius);
    const endX = Math.ceil(x + radius);
    const startY = Math.floor(y - radius);
    const endY = Math.ceil(y + radius);

    for (let yy = startY; yy <= endY; yy++) {
      for (let xx = startX; xx <= endX; xx++) {
        const dx = xx - x + 0.5;
        const dy = yy - y + 0.5;
        if (dx * dx + dy * dy <= r2) {
          this.createParticleAt(xx, yy, color);
        }
      }
    }
  }

  stampBrushLine(x0, y0, x1, y1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx, dy) || 1;
    const step = 0.5;
    const steps = Math.ceil(dist / step);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x0 + dx * t;
      const y = y0 + dy * t;
      this.stampBrushAt(x, y);
    }
  }

  drawLine(x0, y0, x1, y1) {
    const color = this.controls.getColor();
    const width = this.controls.getBrushSize();
    const radius = width / 2;
    const r2 = radius * radius;

    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx, dy) || 1;
    const step = 0.5;
    const steps = Math.ceil(dist / step);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = x0 + dx * t;
      const cy = y0 + dy * t;

      const startX = Math.floor(cx - radius);
      const endX = Math.ceil(cx + radius);
      const startY = Math.floor(cy - radius);
      const endY = Math.ceil(cy + radius);

      for (let yy = startY; yy <= endY; yy++) {
        for (let xx = startX; xx <= endX; xx++) {
          const ddx = xx - cx + 0.5;
          const ddy = yy - cy + 0.5;
          if (ddx * ddx + ddy * ddy <= r2) {
            this.createParticleAt(xx, yy, color);
          }
        }
      }
    }
  }

  drawRect(x0, y0, x1, y1) {
    const fillColor = this.controls.getRectFillColor();
    const strokeColor = this.controls.getRectStrokeColor();
    const outlineWidth = this.controls.getOutlineWidth();
    const fillEnabled = this.controls.getRectFillEnabled();
    const strokeEnabled = this.controls.getRectStrokeEnabled();

    const minX = Math.floor(Math.min(x0, x1));
    const maxX = Math.floor(Math.max(x0, x1));
    const minY = Math.floor(Math.min(y0, y1));
    const maxY = Math.floor(Math.max(y0, y1));

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    if (width <= 0 || height <= 0) return;

    const ow = Math.max(1, outlineWidth);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const inLeft = x - minX < ow;
        const inRight = maxX - x < ow;
        const inTop = y - minY < ow;
        const inBottom = maxY - y < ow;

        const isBorder = inLeft || inRight || inTop || inBottom;

        if (isBorder) {
          if (strokeEnabled) this.createParticleAt(x, y, strokeColor);
        } else {
          if (fillEnabled) this.createParticleAt(x, y, fillColor);
        }
      }
    }
  }

  getParticleAtScreen(clientX, clientY) {
    // Map client coordinates to simulation grid coordinates and return particle if present
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left) / this.simScale);
    const y = Math.floor((clientY - rect.top) / this.simScale);
    if (x < 0 || x >= this.simulation.width || y < 0 || y >= this.simulation.height) return null;
    return this.simulation.grid.get(x, y) || null;
  }
}

new App();

