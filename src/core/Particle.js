export class Particle {
  constructor(x, y, color, properties) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.vx = 0;
    this.vy = 0;
    this.color = color;

    // Physical properties
    this.gravity = properties.gravity ?? 0.5;
    this.friction = properties.friction ?? 0.98;
    this.bounciness = properties.bounciness ?? 0.3;
    this.slipperiness = properties.slipperiness ?? 0.5;
    this.density = properties.density ?? 1.0;
    this.inertiaResistance = properties.inertiaResistance ?? 0.1;

    // Interaction properties
    this.type = properties.type ?? 'powder';
    this.liquid = properties.liquid ?? false;
    this.gas = properties.gas ?? false;

    this.settled = false;
    this.updated = false;
  }

  update(dt) {
    this.updated = true;
    this.prevX = this.x;
    this.prevY = this.y;

    // Apply gravity
    this.vy += this.gravity * dt;

    // Apply friction
    this.vx *= this.friction;
    this.vy *= this.friction;

    // Update position
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Check if settled
    const movement = Math.abs(this.x - this.prevX) + Math.abs(this.y - this.prevY);
    this.settled = movement < 0.01 && Math.abs(this.vy) < 0.1;
  }

  resetUpdateFlag() {
    this.updated = false;
  }
}