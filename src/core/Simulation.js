import { Grid } from './Grid.js';
import { PhysicsEngine } from '../physics/PhysicsEngine.js';

export class Simulation {
  constructor(width, height, gridCellSize = 8) {
    this.width = width;
    this.height = height;
    this.particles = [];
    this.grid = new Grid(width, height, gridCellSize);
    this.physics = new PhysicsEngine(this.grid, width, height);
    this.paused = false;
    this.speed = 1.0;
  }

  addParticle(particle) {
    this.particles.push(particle);
  }

  addParticles(particles) {
    this.particles.push(...particles);
  }

  clear() {
    this.particles.length = 0;
    this.grid.clear();
  }

  update(dt) {
    if (this.paused) return;

    const adjustedDt = dt * this.speed;

    // Reset update flags
    for (const particle of this.particles) {
      particle.resetUpdateFlag();
    }

    // Rebuild grid
    this.grid.clear();
    for (const particle of this.particles) {
      this.grid.addParticle(particle);
    }

    // Update particles
    this.physics.update(this.particles, adjustedDt);

    // Remove out-of-bounds particles
    this.particles = this.particles.filter(p => 
      p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height
    );
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.grid.resize(width, height, this.grid.cellSize);
    this.physics.resize(width, height);
  }

  setGridSize(cellSize) {
    this.grid.resize(this.width, this.height, cellSize);
  }

  setPaused(paused) {
    this.paused = paused;
  }

  setSpeed(speed) {
    this.speed = speed;
  }
}