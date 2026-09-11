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

  // Generate sleek cinematic holographic HUD badge (realistic style, non-cartoon)
  createComicTexture(text, bgColor = '#0f172a', textColor = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    // Rounded holographic pill container
    ctx.save();
    const x = 32;
    const y = 20;
    const w = 448;
    const h = 120;
    const r = 24;

    // Dark sleek glassmorphism background
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = 'rgba(11, 17, 30, 0.92)';
    ctx.fill();

    // High-tech glowing perimeter border
    ctx.lineWidth = 4;
    ctx.strokeStyle = bgColor;
    ctx.shadowColor = bgColor;
    ctx.shadowBlur = 18;
    ctx.stroke();

    // Subtle inner cyan highlight line
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 4, w - 8, h - 8, r - 4);
    ctx.stroke();

    // Crisp modern typography
    ctx.font = '900 48px "Outfit", -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Black drop shadow
    ctx.fillStyle = '#000000';
    ctx.fillText(text, 258, 82);

    // Glowing main text
    ctx.fillStyle = textColor;
    ctx.shadowColor = bgColor;
    ctx.shadowBlur = 10;
    ctx.fillText(text, 256, 80);

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
