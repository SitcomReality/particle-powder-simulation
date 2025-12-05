export class PhysicsEngine {
  constructor(grid) {
    this.grid = grid;
  }

  update(dt) {
    // Get current grid dimensions every frame
    const width = this.grid.width;
    const height = this.grid.height;

    // Scan from bottom to top, randomize horizontal direction
    const dir = Math.random() < 0.5 ? 1 : -1;
    
    for (let y = height - 1; y >= 0; y--) {
      const startX = dir > 0 ? 0 : width - 1;
      const endX = dir > 0 ? width : -1;
      
      for (let x = startX; x !== endX; x += dir) {
        const particle = this.grid.get(x, y);
        if (!particle) continue;
        
        if (particle.type === 'gas') {
          this.updateGas(particle, x, y);
        } else if (particle.type === 'liquid') {
          this.updateLiquid(particle, x, y);
        } else if (particle.type === 'powder') {
          this.updatePowder(particle, x, y);
        }
        // solid particles don't move
      }
    }
  }

  updatePowder(particle, x, y) {
    // Try to fall straight down
    if (this.tryMove(particle, x, y, x, y + 1)) return;
    
    // Try diagonal
    const dir = Math.random() < 0.5 ? -1 : 1;
    if (this.tryMove(particle, x, y, x + dir, y + 1)) return;
    if (this.tryMove(particle, x, y, x - dir, y + 1)) return;
  }

  updateLiquid(particle, x, y) {
    // Try to fall straight down
    if (this.tryMove(particle, x, y, x, y + 1)) return;
    
    // Try diagonal
    const dir = Math.random() < 0.5 ? -1 : 1;
    if (this.tryMove(particle, x, y, x + dir, y + 1)) return;
    if (this.tryMove(particle, x, y, x - dir, y + 1)) return;
    
    // Try to spread horizontally
    for (let i = 1; i <= particle.dispersion; i++) {
      if (Math.random() < 0.5) {
        if (this.tryMove(particle, x, y, x + dir * i, y)) return;
        if (this.tryMove(particle, x, y, x - dir * i, y)) return;
      } else {
        if (this.tryMove(particle, x, y, x - dir * i, y)) return;
        if (this.tryMove(particle, x, y, x + dir * i, y)) return;
      }
    }
  }

  updateGas(particle, x, y) {
    // Try to rise
    if (this.tryMove(particle, x, y, x, y - 1)) return;
    
    // Try diagonal up
    const dir = Math.random() < 0.5 ? -1 : 1;
    if (this.tryMove(particle, x, y, x + dir, y - 1)) return;
    if (this.tryMove(particle, x, y, x - dir, y - 1)) return;
    
    // Try to spread horizontally
    for (let i = 1; i <= particle.dispersion; i++) {
      if (Math.random() < 0.5) {
        if (this.tryMove(particle, x, y, x + dir * i, y)) return;
        if (this.tryMove(particle, x, y, x - dir * i, y)) return;
      } else {
        if (this.tryMove(particle, x, y, x - dir * i, y)) return;
        if (this.tryMove(particle, x, y, x + dir * i, y)) return;
      }
    }
  }

  tryMove(particle, x1, y1, x2, y2) {
    const width = this.grid.width;
    const height = this.grid.height;

    if (x2 < 0 || x2 >= width || y2 < 0 || y2 >= height) {
      return false;
    }
    
    const target = this.grid.get(x2, y2);
    
    if (!target) {
      // Empty space - move into it
      this.grid.swap(x1, y1, x2, y2);
      return true;
    } else if (target.density < particle.density) {
      // Target is less dense - displace it
      this.grid.swap(x1, y1, x2, y2);
      return true;
    }
    
    return false;
  }

  resize(width, height) {
    // No longer needed; physics uses grid dimensions directly
  }
}