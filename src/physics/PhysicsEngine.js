export class PhysicsEngine {
  constructor(grid, width, height) {
    this.grid = grid;
    this.width = width;
    this.height = height;
  }

  update(particles, dt) {
    // Update in random order to avoid bias
    const indices = particles.map((_, i) => i);
    this.shuffle(indices);
    
    for (const i of indices) {
      const particle = particles[i];
      if (particle.updated) continue;
      
      this.updateParticle(particle, dt);
    }
  }

  updateParticle(particle, dt) {
    particle.update(dt);
    
    // Boundary collision
    if (particle.y >= this.height - 1) {
      particle.y = this.height - 1;
      particle.vy *= -particle.bounciness;
      if (Math.abs(particle.vy) < 0.5) particle.vy = 0;
    }
    
    if (particle.x <= 0) {
      particle.x = 0;
      particle.vx *= -particle.bounciness;
    } else if (particle.x >= this.width - 1) {
      particle.x = this.width - 1;
      particle.vx *= -particle.bounciness;
    }
    
    // Particle collision
    this.handleCollisions(particle);
  }

  handleCollisions(particle) {
    const nearby = this.grid.getNearbyParticles(particle.x, particle.y, 1);
    
    for (const other of nearby) {
      if (other === particle) continue;
      
      const dx = other.x - particle.x;
      const dy = other.y - particle.y;
      const distSq = dx * dx + dy * dy;
      
      if (distSq < 1 && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const overlap = 1 - dist;
        
        // Separation
        const nx = dx / dist;
        const ny = dy / dist;
        
        const totalDensity = particle.density + other.density;
        const ratio1 = other.density / totalDensity;
        const ratio2 = particle.density / totalDensity;
        
        particle.x -= nx * overlap * ratio1 * (1 - particle.slipperiness);
        particle.y -= ny * overlap * ratio1 * (1 - particle.slipperiness);
        other.x += nx * overlap * ratio2 * (1 - other.slipperiness);
        other.y += ny * overlap * ratio2 * (1 - other.slipperiness);
        
        // Velocity exchange
        const relVx = particle.vx - other.vx;
        const relVy = particle.vy - other.vy;
        const velAlongNormal = relVx * nx + relVy * ny;
        
        if (velAlongNormal < 0) {
          const impulse = 2 * velAlongNormal / totalDensity;
          particle.vx -= impulse * other.density * nx * (1 - particle.inertiaResistance);
          particle.vy -= impulse * other.density * ny * (1 - particle.inertiaResistance);
          other.vx += impulse * particle.density * nx * (1 - other.inertiaResistance);
          other.vy += impulse * particle.density * ny * (1 - other.inertiaResistance);
        }
      }
    }
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }
}