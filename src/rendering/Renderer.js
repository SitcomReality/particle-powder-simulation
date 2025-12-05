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

    // Reset transform before applying new scale
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.pixelRatio, this.pixelRatio);
  }

  render(particles) {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width / this.pixelRatio, this.canvas.height / this.pixelRatio);
    
    // Render particles on a low-resolution grid
    const s = this.scale;
    for (const particle of particles) {
      this.ctx.fillStyle = particle.color;
      this.ctx.fillRect(
        Math.floor(particle.x) * s,
        Math.floor(particle.y) * s,
        s, s
      );
    }
  }
}

