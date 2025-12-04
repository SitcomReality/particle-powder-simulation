export class Grid {
  constructor(width, height, cellSize) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.cells = new Array(this.cols * this.rows);
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i] = [];
    }
  }

  clear() {
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].length = 0;
    }
  }

  getCellIndex(x, y) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return -1;
    }
    
    return row * this.cols + col;
  }

  addParticle(particle) {
    const index = this.getCellIndex(particle.x, particle.y);
    if (index >= 0) {
      this.cells[index].push(particle);
    }
  }

  getCell(x, y) {
    const index = this.getCellIndex(x, y);
    return index >= 0 ? this.cells[index] : [];
  }

  getNearbyParticles(x, y, radius = 1) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    const particles = [];
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const checkCol = col + dx;
        const checkRow = row + dy;
        
        if (checkCol >= 0 && checkCol < this.cols && 
            checkRow >= 0 && checkRow < this.rows) {
          const index = checkRow * this.cols + checkCol;
          particles.push(...this.cells[index]);
        }
      }
    }
    
    return particles;
  }

  resize(width, height, cellSize) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    
    const newCells = new Array(this.cols * this.rows);
    for (let i = 0; i < newCells.length; i++) {
      newCells[i] = [];
    }
    this.cells = newCells;
  }
}