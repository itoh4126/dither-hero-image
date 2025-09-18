export class DitherBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.imageData = null;
    this.animationId = null;
    this.time = 0;
    this.mouse = { x: 0.5, y: 0.5 };
    this.targetMouse = { x: 0.5, y: 0.5 };
    this.pixelSize = 2; // Fine particle size
    this.scrollOffset = 0; // For scroll-based animation

    // Configurable particle settings
    this.particleColor = { r: 0, g: 0, b: 0 }; // #000
    this.baseOpacity = 50; // Base opacity for particles
    this.densityReduction = 0.3; // Reduces density for subtlety

    this.resize();
    this.init();
    this.setupEventListeners();
    this.animate();
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = e.clientX / window.innerWidth;
      this.targetMouse.y = e.clientY / window.innerHeight;
    });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';

    this.ctx.imageSmoothingEnabled = false;

    if (this.imageData) {
      this.init();
    }
  }

  init() {
    this.imageData = this.ctx.createImageData(this.width, this.height);
  }

  // Bayer matrix for dithering
  bayerMatrix4x4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ];

  getBayerValue(x, y) {
    return this.bayerMatrix4x4[y % 4][x % 4] / 16.0;
  }

  // Flow function that creates left-to-right movement with mouse influence
  flowFunction(x, y, time, mouseX, mouseY) {
    const normalizedX = x / this.width;
    const normalizedY = y / this.height;

    // Distance from mouse
    const dx = normalizedX - mouseX;
    const dy = normalizedY - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Horizontal flow (left to right) - slower and more gentle
    const flowSpeed = 0.0008; // Reduced speed for more relaxed feel
    const flowPhase = normalizedX * 6 - time * flowSpeed + this.scrollOffset; // Larger wavelength

    // Vertical waves - larger and gentler
    const verticalWave = Math.sin(normalizedY * 3 + time * 0.0005) * 0.4; // Larger waves

    // Main flow pattern - gentler
    const mainFlow = Math.sin(flowPhase) * 0.5;

    // Secondary flow for texture - more subtle
    const secondaryFlow = Math.sin(flowPhase * 0.8 + normalizedY * 2) * 0.15;

    // Mouse interaction - creates larger, gentler ripples
    const mouseInfluence = Math.exp(-distance * 4) * Math.sin(distance * 12 - time * 0.004) * 0.3;

    // Noise for fine detail - more subtle
    const noise = (Math.sin(normalizedX * 15 + time * 0.002) * Math.cos(normalizedY * 10 + time * 0.001)) * 0.05;

    return (mainFlow + secondaryFlow + verticalWave + mouseInfluence + noise) * 0.5 + 0.5;
  }

  generateFrame() {
    // Smooth mouse interpolation
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;

    const data = this.imageData.data;

    for (let y = 0; y < this.height; y += this.pixelSize) {
      for (let x = 0; x < this.width; x += this.pixelSize) {
        // Get flow value
        const flowValue = this.flowFunction(x, y, this.time, this.mouse.x, this.mouse.y);

        // Apply Bayer dithering with density reduction
        const bayerThreshold = this.getBayerValue(Math.floor(x / this.pixelSize), Math.floor(y / this.pixelSize));

        // Reduce particle density - higher values mean fewer particles
        const adjustedThreshold = bayerThreshold + (1 - bayerThreshold) * this.densityReduction;
        const dithered = flowValue > adjustedThreshold ? 1 : 0;

        // Configurable particle color and opacity
        const r = this.particleColor.r;
        const g = this.particleColor.g;
        const b = this.particleColor.b;
        const alpha = dithered * this.baseOpacity;

        // Fill pixel block
        for (let dy = 0; dy < this.pixelSize && y + dy < this.height; dy++) {
          for (let dx = 0; dx < this.pixelSize && x + dx < this.width; dx++) {
            const index = ((y + dy) * this.width + (x + dx)) * 4;
            data[index] = r;     // Red
            data[index + 1] = g; // Green
            data[index + 2] = b; // Blue
            data[index + 3] = alpha; // Alpha
          }
        }
      }
    }

    this.ctx.putImageData(this.imageData, 0, 0);
  }

  animate() {
    this.time += 16; // ~60fps
    this.generateFrame();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  setScrollOffset(offset) {
    this.scrollOffset = offset;
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousemove', this.setupEventListeners);
  }
}
