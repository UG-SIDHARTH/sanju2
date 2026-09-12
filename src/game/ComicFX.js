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

  // Generate authentic Anime / Manga Action Burst bubble with speedlines & ink contours
  createComicTexture(text, bgColor = '#e11d48', textColor = '#fef08a') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;

    ctx.save();
    const cx = 256;
    const cy = 100;
    const rx = 230;
    const ry = 80;

    // 1. Draw Multi-Pointed Jagged Anime Manga Starburst Bubble
    const points = 24;
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      // Alternate between outer spikes and inner notches with slight random jaggedness
      const isSpike = i % 2 === 0;
      const radFactor = isSpike ? 1.05 : 0.72;
      const px = cx + Math.cos(angle) * rx * radFactor;
      const py = cy + Math.sin(angle) * ry * radFactor;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    // Solid dark drop-shadow for high-impact manga cel effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 6;
    ctx.shadowOffsetY = 6;

    // Vibrant anime action gradient fill
    const grad = ctx.createLinearGradient(0, 20, 0, 180);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, bgColor);
    grad.addColorStop(1, '#090d16');
    ctx.fillStyle = grad;
    ctx.fill();

    // Reset shadow for crisp ink outlines
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Thick black manga ink contour border
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#05070d';
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 4;
    ctx.stroke();

    // 2. Anime Radial Speedlines
    ctx.save();
    ctx.clip(); // Clip inside starburst
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2.5;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 30, cy + Math.sin(a) * 20);
      ctx.lineTo(cx + Math.cos(a) * rx * 1.3, cy + Math.sin(a) * ry * 1.3);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Bold Anime / Manga Typography
    ctx.font = '900 50px "Bangers", "Outfit", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Black heavy manga ink drop outline
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#05070d';
    ctx.lineJoin = 'round';
    ctx.strokeText(text, cx + 2, cy + 4);

    // Thick sharp inner border
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(text, cx, cy);

    // Glowing vibrant text fill
    ctx.fillStyle = textColor;
    ctx.fillText(text, cx, cy);

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
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
