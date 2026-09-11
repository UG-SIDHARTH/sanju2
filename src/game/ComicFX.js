// ==========================================================================
// COMIC FX - 3D Onomatopoeia & Floating Comic Popups ("THWIP!", "HAHAHA!")
// ==========================================================================

import * as THREE from 'three';

export class ComicFX {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.activePopups = [];
    this.bannerEl = document.getElementById('comic-announcer');
    this.bannerTimer = null;
  }

  // Generate dynamic 2D canvas texture for comic sound badge
  createComicTexture(text, bgColor = '#e62429', textColor = '#ffeb3b') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Comic explosion burst background shape
    ctx.save();
    ctx.translate(256, 128);

    const spikes = 14;
    const outerRadius = 110;
    const innerRadius = 70;

    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r * 0.7; // slight elliptical
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    // Text rendering with comic typography
    ctx.font = '900 64px "Bangers", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Black shadow/outline
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(text, 0, 0);

    // Colored fill
    ctx.fillStyle = textColor;
    ctx.fillText(text, 0, 0);

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // Spawn 3D floating comic badge at world position
  spawnAt(position, text, bgColor = '#e62429', textColor = '#ffeb3b', duration = 1.2) {
    const texture = this.createComicTexture(text, bgColor, textColor);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.position.y += 2.5; // Hover over head
    sprite.scale.set(0.1, 0.05, 1); // Start small for pop-in

    this.scene.add(sprite);

    this.activePopups.push({
      sprite,
      material,
      texture,
      elapsed: 0,
      duration,
      initialY: sprite.position.y,
      targetScaleX: 3.6,
      targetScaleY: 1.8
    });
  }

  // Show full-screen dramatic comic announcement
  showBanner(text, duration = 1800) {
    if (!this.bannerEl) return;
    this.bannerEl.textContent = text;
    this.bannerEl.classList.remove('hidden');
    // Force reflow
    void this.bannerEl.offsetWidth;
    this.bannerEl.classList.add('show');

    if (this.bannerTimer) clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => {
      this.bannerEl.classList.remove('show');
      setTimeout(() => {
        this.bannerEl.classList.add('hidden');
      }, 300);
    }, duration);
  }

  update(delta) {
    for (let i = this.activePopups.length - 1; i >= 0; i--) {
      const p = this.activePopups[i];
      p.elapsed += delta;
      const progress = p.elapsed / p.duration;

      if (progress >= 1) {
        this.scene.remove(p.sprite);
        p.material.dispose();
        p.texture.dispose();
        this.activePopups.splice(i, 1);
        continue;
      }

      // Pop-in scale with bounce, then fade out
      if (progress < 0.25) {
        const t = progress / 0.25;
        const scale = 1 + Math.sin(t * Math.PI) * 0.4;
        p.sprite.scale.set(p.targetScaleX * scale * t, p.targetScaleY * scale * t, 1);
      } else if (progress > 0.7) {
        const fadeT = (progress - 0.7) / 0.3;
        p.material.opacity = 1 - fadeT;
      }

      // Float upward gently
      p.sprite.position.y = p.initialY + progress * 2.0;
    }
  }
}
