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
    const elapsed = now - this.lastTime;
    const dt = Math.min(elapsed / 1000, 0.1);
    this.lastTime = now;

    // FPS Calculation
    this.frameCounter++;
    this.fpsTime += elapsed;
    
    if (this.fpsTime >= 1000) {
      const fps = Math.round(this.frameCounter / (this.fpsTime / 1000));
      this.fpsDisplay.textContent = `FPS: ${fps}`;
      this.frameCounter = 0;
      this.fpsTime = 0;
    }
    
    this.simulation.update(dt);
    this.renderer.render(this.simulation.particles);
  }

  setupDrawing() {
    const canvas = this.canvas;

    const getCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
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
          this.createParticleAt(x, y, strokeColor);
        } else {
          this.createParticleAt(x, y, fillColor);
        }
      }
    }
  }
}

new App();

