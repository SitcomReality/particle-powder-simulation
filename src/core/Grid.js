export class Grid {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.cells = new Array(width * height);
  }

  clear() {
    this.cells.fill(null);
  }

  get(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return undefined;
    }
    return this.cells[y * this.width + x];
  }

  set(x, y, particle) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }
    this.cells[y * this.width + x] = particle;
    if (particle) {
      particle.x = x;
      particle.y = y;
    }
  }

  swap(x1, y1, x2, y2) {
    if (x1 < 0 || x1 >= this.width || y1 < 0 || y1 >= this.height ||
        x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height) {
      return false;
    }
    
    const idx1 = y1 * this.width + x1;
    const idx2 = y2 * this.width + x2;
    const temp = this.cells[idx1];
    
    this.cells[idx1] = this.cells[idx2];
    this.cells[idx2] = temp;
    
    if (this.cells[idx1]) {
      this.cells[idx1].x = x1;
      this.cells[idx1].y = y1;
    }
    if (this.cells[idx2]) {
      this.cells[idx2].x = x2;
      this.cells[idx2].y = y2;
    }
    
    return true;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.cells = new Array(width * height);
  }

  getAllParticles() {
    return this.cells.filter(p => p !== null);
  }
}