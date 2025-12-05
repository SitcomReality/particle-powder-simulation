export class Particle {
  constructor(x, y, color, properties) {
    this.x = x;
    this.y = y;
    this.color = color;

    // Simplified properties for cellular automaton
    this.density = properties.density ?? 1.0;
    this.type = properties.type ?? 'powder'; // 'powder', 'liquid', 'gas', 'solid'
    this.dispersion = properties.dispersion ?? 1; // How far liquids/gases spread horizontally
  }
}