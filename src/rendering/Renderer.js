export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.pixelRatio = window.devicePixelRatio || 1;
  }

  resize(width, height) {
    this.canvas.width = width * this.pixelRatio;
    this.canvas.height = height * this.pixelRatio;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.ctx.scale(this.pixelRatio, this.pixelRatio);
  }

  render(particles) {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render particles
    for (const particle of particles) {
      this.ctx.fillStyle = particle.color;
      this.ctx.fillRect(
        Math.floor(particle.x),
        Math.floor(particle.y),
        1, 1
      );
    }
  }
}

