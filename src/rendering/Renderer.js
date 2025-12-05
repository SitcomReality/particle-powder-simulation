export class Renderer {
  constructor(canvas, scale = 4) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.pixelRatio = window.devicePixelRatio || 1;
    this.scale = scale;
  }

  resize(width, height) {
    this.canvas.width = width * this.pixelRatio;
    this.canvas.height = height * this.pixelRatio;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.pixelRatio, this.pixelRatio);
  }

  render(grid) {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width / this.pixelRatio, this.canvas.height / this.pixelRatio);
    
    const s = this.scale;
    
    // Render grid cells directly
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const particle = grid.get(x, y);
        if (particle) {
          this.ctx.fillStyle = particle.color;
          this.ctx.fillRect(x * s, y * s, s, s);
        }
      }
    }
  }
}

