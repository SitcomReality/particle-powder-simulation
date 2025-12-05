export class Controls {
  constructor(simulation, presetManager, colorMapper, imageLoader, sampleCallback) {
    this.simulation = simulation;
    this.presetManager = presetManager;
    this.colorMapper = colorMapper;
    this.imageLoader = imageLoader;
    this.sampleCallback = sampleCallback; // function(clientX, clientY) -> particle or null

    this.state = {
      tool: 'brush',
      brushSize: 4,
      color: '#ffcc00',
      rectFillColor: '#ffcc00',
      rectStrokeColor: '#111111',
      outlineWidth: 2,
      rectFillEnabled: true,
      rectStrokeEnabled: true
    };
    
    this.awaitingPick = null; // 'brush' | 'rectFill' | 'rectStroke' | null
    
    this.setupEventListeners();
    this.updatePresetList();
  }

  setupEventListeners() {
    // Simulation speed
    const simSpeedInput = document.getElementById('simSpeed');
    const simSpeedValue = document.getElementById('simSpeedValue');
    simSpeedInput.addEventListener('input', (e) => {
      const speed = parseFloat(e.target.value);
      simSpeedValue.textContent = speed.toFixed(1);
      this.simulation.setSpeed(speed);
    });

    // Drawing tool
    const toolSelect = document.getElementById('toolSelect');
    toolSelect.addEventListener('change', (e) => {
      this.state.tool = e.target.value;
    });

    // Brush / line width
    const brushSizeInput = document.getElementById('brushSize');
    const brushSizeValue = document.getElementById('brushSizeValue');
    brushSizeInput.addEventListener('input', (e) => {
      const size = parseInt(e.target.value, 10);
      this.state.brushSize = size;
      brushSizeValue.textContent = size;
    });

    // Primary color picker
    const colorPicker = document.getElementById('colorPicker');
    colorPicker.addEventListener('input', (e) => {
      this.state.color = e.target.value;
    });

    // Eyedropper for brush
    const eyedropBrush = document.getElementById('eyedropBrush');
    eyedropBrush.addEventListener('click', () => this.startPick('brush'));

    // Color palette buttons
    const palette = document.getElementById('colorPalette');
    palette.addEventListener('click', (e) => {
      const btn = e.target.closest('.color-swatch-btn');
      if (!btn) return;
      const color = btn.dataset.color;
      this.state.color = color;
      colorPicker.value = color;
    });

    // Rectangle fill / stroke colors
    const rectFillColorInput = document.getElementById('rectFillColor');
    const rectStrokeColorInput = document.getElementById('rectStrokeColor');
    rectFillColorInput.addEventListener('input', (e) => {
      this.state.rectFillColor = e.target.value;
    });
    rectStrokeColorInput.addEventListener('input', (e) => {
      this.state.rectStrokeColor = e.target.value;
    });

    // Eyedroppers for rect
    const eyedropRectFill = document.getElementById('eyedropRectFill');
    const eyedropRectStroke = document.getElementById('eyedropRectStroke');
    eyedropRectFill.addEventListener('click', () => this.startPick('rectFill'));
    eyedropRectStroke.addEventListener('click', () => this.startPick('rectStroke'));

    // Fill / stroke toggles
    const rectFillEnabledInput = document.getElementById('rectFillEnabled');
    const rectStrokeEnabledInput = document.getElementById('rectStrokeEnabled');
    rectFillEnabledInput.addEventListener('change', (e) => {
      this.state.rectFillEnabled = !!e.target.checked;
    });
    rectStrokeEnabledInput.addEventListener('change', (e) => {
      this.state.rectStrokeEnabled = !!e.target.checked;
    });

    // Outline width
    const outlineWidthInput = document.getElementById('outlineWidth');
    const outlineWidthValue = document.getElementById('outlineWidthValue');
    outlineWidthInput.addEventListener('input', (e) => {
      const w = parseInt(e.target.value, 10);
      this.state.outlineWidth = w;
      outlineWidthValue.textContent = w;
    });

    // Load image
    const loadImageBtn = document.getElementById('loadImage');
    const imageInput = document.getElementById('imageInput');
    loadImageBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const particles = await this.imageLoader.loadImage(
            file,
            this.simulation.width,
            this.simulation.height
          );
          this.simulation.clear();
          this.simulation.addParticles(particles);
        } catch (err) {
          console.error('Failed to load image:', err);
        }
      }
    });

    // Load calibration quadrants
    const quadRoseBtn = document.getElementById('loadQuadRose');
    const quadCyberpunkBtn = document.getElementById('loadQuadCyberpunk');
    const quadDesertBtn = document.getElementById('loadQuadDesert');
    const quadGeometryBtn = document.getElementById('loadQuadGeometry');

    const loadQuadrant = async (index) => {
      try {
        const particles = await this.imageLoader.loadPresetQuadrant(
          index,
          this.simulation.width,
          this.simulation.height
        );
        this.simulation.clear();
        this.simulation.addParticles(particles);
      } catch (err) {
        console.error('Failed to load calibration quadrant:', err);
      }
    };

    if (quadRoseBtn) {
      quadRoseBtn.addEventListener('click', () => loadQuadrant(0));
    }
    if (quadCyberpunkBtn) {
      quadCyberpunkBtn.addEventListener('click', () => loadQuadrant(1));
    }
    if (quadDesertBtn) {
      quadDesertBtn.addEventListener('click', () => loadQuadrant(2));
    }
    if (quadGeometryBtn) {
      quadGeometryBtn.addEventListener('click', () => loadQuadrant(3));
    }

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
          // Immediately update all existing particles to use the new spectral mapping
          this.simulation.remapParticleProperties(this.colorMapper);
          this.updateColorMapDisplay();
        }
      }
    });

    // Randomize preset
    document.getElementById('randomizePreset').addEventListener('click', () => {
      this.colorMapper.randomizeMapping();
      // Immediately update all existing particles when randomizing mapping
      this.simulation.remapParticleProperties(this.colorMapper);
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
    
    const preset = this.colorMapper.toJSON();
    
    // Display preset parameters
    const title = document.createElement('h4');
    title.textContent = 'Spectral Heuristic Parameters';
    title.style.fontSize = '11px';
    title.style.marginBottom = '8px';
    container.appendChild(title);
    
    for (const [key, value] of Object.entries(preset)) {
      const item = document.createElement('div');
      item.className = 'property-item';
      item.style.fontSize = '10px';
      item.style.marginBottom = '3px';
      
      const displayValue = typeof value === 'number' ? value.toFixed(2) : value;
      item.innerHTML = `<span>${key}:</span><span>${displayValue}</span>`;
      container.appendChild(item);
    }
    
    // Show color samples
    const samplesTitle = document.createElement('h4');
    samplesTitle.textContent = 'Color Samples';
    samplesTitle.style.fontSize = '11px';
    samplesTitle.style.marginTop = '12px';
    samplesTitle.style.marginBottom = '8px';
    container.appendChild(samplesTitle);
    
    const sampleColors = [
      '#ff0000', '#00ff00', '#0000ff', 
      '#ffff00', '#00ffff', '#ff00ff',
      '#ffffff', '#808080', '#000000'
    ];
    
    for (const color of sampleColors) {
      const entry = document.createElement('div');
      entry.className = 'color-map-entry';
      
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor = color;
      
      const props = this.colorMapper.getProperties(color);
      const propList = document.createElement('div');
      propList.className = 'property-list';
      
      for (const [key, value] of Object.entries(props)) {
        const propItem = document.createElement('div');
        propItem.className = 'property-item';
        if (typeof value === 'number') {
          propItem.innerHTML = `<span>${key}:</span><span>${value.toFixed(2)}</span>`;
        } else {
          propItem.innerHTML = `<span>${key}:</span><span>${value}</span>`;
        }
        propList.appendChild(propItem);
      }
      
      entry.appendChild(swatch);
      entry.appendChild(propList);
      container.appendChild(entry);
    }
  }

  getTool() {
    return this.state.tool;
  }

  getBrushSize() {
    return this.state.brushSize;
  }

  getColor() {
    return this.state.color;
  }

  getRectFillEnabled() {
    return !!this.state.rectFillEnabled;
  }

  getRectStrokeEnabled() {
    return !!this.state.rectStrokeEnabled;
  }

  getRectFillColor() {
    return this.state.rectFillColor;
  }

  getRectStrokeColor() {
    return this.state.rectStrokeColor;
  }

  getOutlineWidth() {
    return this.state.outlineWidth;
  }

  startPick(target) {
    // target is 'brush' | 'rectFill' | 'rectStroke'
    this.awaitingPick = target;
    // Temporarily change cursor to crosshair
    document.body.style.cursor = 'crosshair';

    const onPointer = (ev) => {
      // Use the provided sampling callback to get particle under pointer
      const sample = this.sampleCallback ? this.sampleCallback(ev.clientX, ev.clientY) : null;
      if (sample && sample.color) {
        if (this.awaitingPick === 'brush') {
          this.state.color = sample.color;
          const cp = document.getElementById('colorPicker');
          if (cp) cp.value = sample.color;
        } else if (this.awaitingPick === 'rectFill') {
          this.state.rectFillColor = sample.color;
          const rf = document.getElementById('rectFillColor');
          if (rf) rf.value = sample.color;
        } else if (this.awaitingPick === 'rectStroke') {
          this.state.rectStrokeColor = sample.color;
          const rs = document.getElementById('rectStrokeColor');
          if (rs) rs.value = sample.color;
        }
      }
      cleanup();
    };

    const cleanup = () => {
      document.body.style.cursor = '';
      this.awaitingPick = null;
      window.removeEventListener('pointerdown', onPointer);
    };

    window.addEventListener('pointerdown', onPointer, { once: true });
  }
}