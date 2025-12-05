export class Grid {
  constructor(width, height) {
    // Coerce to safe integers and enforce minimums to avoid invalid array lengths
    this.width = Math.max(1, Math.floor(Number(width) || 0));
    this.height = Math.max(1, Math.floor(Number(height) || 0));

    // Guard against absurdly large grids (protect browser)
    const maxCells = 2 ** 20; // ~1,048,576 cells by default
    const requested = this.width * this.height;
    if (requested > maxCells) {
      // Scale down while preserving aspect ratio
      const scale = Math.sqrt(maxCells / requested);
      this.width = Math.max(1, Math.floor(this.width * scale));
      this.height = Math.max(1, Math.floor(this.height * scale));
    }

    this.cells = new Array(this.width * this.height).fill(null);
  }

  clear() {
    if (!this.cells || this.cells.length !== this.width * this.height) {
      this.cells = new Array(this.width * this.height).fill(null);
    } else {
      this.cells.fill(null);
    }
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
    // Coerce and enforce minimums
    this.width = Math.max(1, Math.floor(Number(width) || 0));
    this.height = Math.max(1, Math.floor(Number(height) || 0));

    // Guard against very large sizes similarly to constructor
    const maxCells = 2 ** 20;
    const requested = this.width * this.height;
    if (requested > maxCells) {
      const scale = Math.sqrt(maxCells / requested);
      this.width = Math.max(1, Math.floor(this.width * scale));
      this.height = Math.max(1, Math.floor(this.height * scale));
    }

    this.cells = new Array(this.width * this.height).fill(null);
  }

  getAllParticles() {
    return this.cells.filter(p => p !== null);
  }
}