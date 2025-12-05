import { Grid } from './Grid.js';
import { PhysicsEngine } from '../physics/PhysicsEngine.js';

export class Simulation {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = new Grid(width, height);
    this.physics = new PhysicsEngine(this.grid, width, height);
    this.paused = false;
    this.speed = 1.0;
    this.stepAccumulator = 0;
  }

  addParticle(particle) {
    const x = Math.floor(particle.x);
    const y = Math.floor(particle.y);

    // Only attempt to place if coordinates are inside the grid bounds
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

    // Overwrite whatever is at the target cell so drawing replaces existing particles.
    // Grid.set will update particle.x/particle.y to the integer cell coordinates.
    this.grid.set(x, y, particle);
  }

  addParticles(particles) {
    for (const particle of particles) {
      this.addParticle(particle);
    }
  }

  clear() {
    this.grid.clear();
  }

  update(dt) {
    if (this.paused) return;

    // Fixed timestep for stability
    const fixedDt = 1 / 60;
    this.stepAccumulator += dt * this.speed;
    
    let steps = 0;
    const maxSteps = 3; // Prevent spiral of death
    
    while (this.stepAccumulator >= fixedDt && steps < maxSteps) {
      this.physics.update(fixedDt);
      this.stepAccumulator -= fixedDt;
      steps++;
    }
    
    if (this.stepAccumulator >= fixedDt * maxSteps) {
      this.stepAccumulator = 0;
    }
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.grid.resize(width, height);
    // PhysicsEngine now reads dimensions from grid, no need to pass width/height
    // this.physics.resize(width, height);
  }

  // Recompute properties (type, density, dispersion) for all existing particles
  // using the current ColorMapper heuristic so presets immediately affect behavior.
  remapParticleProperties(colorMapper) {
    const cells = this.grid.cells;
    for (let i = 0; i < cells.length; i++) {
      const p = cells[i];
      if (!p) continue;
      const props = colorMapper.getProperties(p.color);
      p.type = props.type;
      p.density = props.density;
      p.dispersion = props.dispersion;
    }
  }

  setPaused(paused) {
    this.paused = paused;
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  get particles() {
    return this.grid.getAllParticles();
  }
}