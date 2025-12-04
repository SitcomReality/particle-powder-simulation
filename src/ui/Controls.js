export class Controls {
  constructor(simulation, presetManager, colorMapper, imageLoader) {
    this.simulation = simulation;
    this.presetManager = presetManager;
    this.colorMapper = colorMapper;
    this.imageLoader = imageLoader;
    
    this.setupEventListeners();
    this.updatePresetList();
  }

  setupEventListeners() {
    // Grid size
    const gridSizeInput = document.getElementById('gridSize');
    const gridSizeValue = document.getElementById('gridSizeValue');
    gridSizeInput.addEventListener('input', (e) => {
      const size = parseInt(e.target.value);
      gridSizeValue.textContent = size;
      this.simulation.setGridSize(size);
    });

    // Simulation speed
    const simSpeedInput = document.getElementById('simSpeed');
    const simSpeedValue = document.getElementById('simSpeedValue');
    simSpeedInput.addEventListener('input', (e) => {
      const speed = parseFloat(e.target.value);
      simSpeedValue.textContent = speed.toFixed(1);
      this.simulation.setSpeed(speed);
    });

    // Load image
    const loadImageBtn = document.getElementById('loadImage');
    const imageInput = document.getElementById('imageInput');
    loadImageBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const particles = await this.imageLoader.loadImage(file);
          this.simulation.clear();
          this.simulation.addParticles(particles);
        } catch (err) {
          console.error('Failed to load image:', err);
        }
      }
    });

    // Clear
    document.getElementById('clear').addEventListener('click', () => {
      this.simulation.clear();
    });

    // Pause
    const pauseBtn = document.getElementById('pause');
    pauseBtn.addEventListener('click', () => {
      this.simulation.setPaused(!this.simulation.paused);
      pauseBtn.textContent = this.simulation.paused ? 'Resume' : 'Pause';
    });

    // Load preset
    document.getElementById('loadPreset').addEventListener('click', () => {
      const select = document.getElementById('presetSelect');
      const presetName = select.value;
      if (presetName) {
        const preset = this.presetManager.getPreset(presetName);
        if (preset) {
          this.colorMapper.fromJSON(preset);
          this.updateColorMapDisplay();
        }
      }
    });

    // Randomize preset
    document.getElementById('randomizePreset').addEventListener('click', () => {
      const uniqueColors = new Set();
      for (const particle of this.simulation.particles) {
        uniqueColors.add(particle.color);
      }
      this.colorMapper.randomizeMapping(Array.from(uniqueColors));
      this.updateColorMapDisplay();
    });

    // Save preset
    document.getElementById('savePreset').addEventListener('click', () => {
      const nameInput = document.getElementById('presetName');
      const name = nameInput.value.trim();
      if (name) {
        this.presetManager.savePreset(name, this.colorMapper.toJSON());
        this.updatePresetList();
        nameInput.value = '';
      }
    });

    // Delete preset
    document.getElementById('deletePreset').addEventListener('click', () => {
      const select = document.getElementById('presetSelect');
      const presetName = select.value;
      if (presetName && confirm(`Delete preset "${presetName}"?`)) {
        this.presetManager.deletePreset(presetName);
        this.updatePresetList();
      }
    });

    // Toggle color map
    document.getElementById('toggleColorMap').addEventListener('click', () => {
      const panel = document.getElementById('colorMapPanel');
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      if (panel.style.display === 'block') {
        this.updateColorMapDisplay();
      }
    });
  }

  updatePresetList() {
    const select = document.getElementById('presetSelect');
    select.innerHTML = '';
    
    for (const name of this.presetManager.listPresets()) {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    }
  }

  updateColorMapDisplay() {
    const container = document.getElementById('colorMapContent');
    container.innerHTML = '';
    
    const colorMapData = this.colorMapper.toJSON();
    
    for (const [color, properties] of colorMapData) {
      const entry = document.createElement('div');
      entry.className = 'color-map-entry';
      
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor = color;
      
      const propList = document.createElement('div');
      propList.className = 'property-list';
      
      for (const [key, value] of Object.entries(properties)) {
        if (typeof value === 'number') {
          const propItem = document.createElement('div');
          propItem.className = 'property-item';
          propItem.innerHTML = `<span>${key}:</span><span>${value.toFixed(2)}</span>`;
          propList.appendChild(propItem);
        }
      }
      
      entry.appendChild(swatch);
      entry.appendChild(propList);
      container.appendChild(entry);
    }
  }
}