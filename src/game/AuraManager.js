// ==========================================================================
// AURA MANAGER - Clean Cinematic Action FX & Manga Speed Lines Engine
// REMOVED ALL UGLY GLOWS, CHARACTER AURAS, AND AMBIENT FLOATING PARTICLES
// Delivers pure, cinematic, restrained anime focus effects during key events ONLY
// ==========================================================================

import * as THREE from 'three';

export class AuraManager {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.animTime = 0;
    this.speedLinesActive = false;
    this.speedLinesIntensity = 0;
    this.characterAuras = [];

    // Zero ambient particles, zero floating dots, zero ribbons, zero mist.
    // Only fullscreen speedlines canvas for dynamic cinematic action events.
    this.setupSpeedLinesCanvas();
  }

  // Safe stub: Characters must NOT have glowing bodies or auras
  createCharacterAura(targetObject, colorHex = 0x38bdf8, scale = 1.0) {
    // Intentionally no-op: NO glowing body, NO aura, NO halo, NO flame cylinder
    return null;
  }

  // --- FULLSCREEN ANIME SPEED LINES / ACTION FOCUS LINES OVERLAY ---
  // Triggered ONLY during dynamic special events (web pull, goblin swoop, portal warp, climax)
  setupSpeedLinesCanvas() {
    this.speedLinesCanvas = document.createElement('canvas');
    this.speedLinesCanvas.id = 'anime-speed-lines';
    this.speedLinesCanvas.style.position = 'fixed';
    this.speedLinesCanvas.style.top = '0';
    this.speedLinesCanvas.style.left = '0';
    this.speedLinesCanvas.style.width = '100%';
    this.speedLinesCanvas.style.height = '100%';
    this.speedLinesCanvas.style.pointerEvents = 'none';
    this.speedLinesCanvas.style.zIndex = '15';
    this.speedLinesCanvas.style.opacity = '0';
    this.speedLinesCanvas.style.transition = 'opacity 0.18s ease-out';

    document.body.appendChild(this.speedLinesCanvas);
    this.speedCtx = this.speedLinesCanvas.getContext('2d');

    this.resizeSpeedLines();
    window.addEventListener('resize', () => this.resizeSpeedLines());
  }

  resizeSpeedLines() {
    if (!this.speedLinesCanvas) return;
    this.speedLinesCanvas.width = window.innerWidth;
    this.speedLinesCanvas.height = window.innerHeight;
  }

  triggerSpeedLines(duration = 1.2, intensity = 1.0) {
    this.speedLinesActive = true;
    this.speedLinesIntensity = intensity;
    if (this.speedLinesCanvas) {
      this.speedLinesCanvas.style.opacity = `${Math.min(1.0, 0.82 * intensity)}`;
    }

    if (this.speedTimeout) clearTimeout(this.speedTimeout);
    this.speedTimeout = setTimeout(() => {
      this.speedLinesActive = false;
      if (this.speedLinesCanvas) {
        this.speedLinesCanvas.style.opacity = '0';
      }
    }, duration * 1000);
  }

  renderSpeedLines() {
    if (!this.speedLinesActive || !this.speedCtx || !this.speedLinesCanvas) return;

    const w = this.speedLinesCanvas.width;
    const h = this.speedLinesCanvas.height;
    const ctx = this.speedCtx;

    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.5;
    const linesCount = 70;
    const maxRadius = Math.hypot(cx, cy);
    const innerRadius = Math.min(w, h) * 0.28;

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 2.0;

    for (let i = 0; i < linesCount; i++) {
      if (Math.random() > 0.42) continue;
      const angle = (i / linesCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
      const startR = innerRadius + Math.random() * (innerRadius * 0.45);
      const endR = maxRadius;

      const x1 = cx + Math.cos(angle) * startR;
      const y1 = cy + Math.sin(angle) * startR;
      const x2 = cx + Math.cos(angle) * endR;
      const y2 = cy + Math.sin(angle) * endR;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  update(delta) {
    this.animTime += delta;

    if (this.speedLinesActive) {
      this.renderSpeedLines();
    }
  }

  dispose() {
    if (this.speedLinesCanvas && this.speedLinesCanvas.parentNode) {
      this.speedLinesCanvas.parentNode.removeChild(this.speedLinesCanvas);
    }
  }
}
