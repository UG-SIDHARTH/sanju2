// ==========================================================================
// ENVIRONMENT - High-Performance Comic Penthouse & Fast Backdrop
// Optimized for Intel Pentium & Integrated Graphics (60+ FPS)
// ==========================================================================

import * as THREE from 'three';

export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.neonSigns = [];
    this.clock = new THREE.Clock();

    this.createLights();
    this.createRooftopBase();
    this.createComicBackdrop();
  }

  createLights() {
    // Bright, high-clarity ambient light - ensures zero dark spots and zero GPU lag
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(ambientLight);

    // Single clean directional comic keylight (no shadow map calculation for maximum FPS)
    const keyLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    keyLight.position.set(20, 40, 30);
    this.scene.add(keyLight);

    // Subtle blue fill light from the opposite side
    const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.6);
    fillLight.position.set(-20, 20, -20);
    this.scene.add(fillLight);
  }

  createRooftopBase() {
    // Clean, crisp rooftop platform
    const baseGeo = new THREE.BoxGeometry(40, 1.5, 40);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.8;
    this.scene.add(base);

    // Clean outer border railing
    const borderGeo = new THREE.BoxGeometry(40.6, 0.3, 40.6);
    const borderMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.y = -0.05;
    this.scene.add(border);
  }

  // Lightweight 2D canvas comic skyline backdrop curved around the arena
  createComicBackdrop() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Deep comic night gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#030712');
    grad.addColorStop(0.6, '#0f172a');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 256);

    // Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 80; i++) {
      const x = (i * 37) % 1024;
      const y = (i * 19) % 120;
      ctx.fillRect(x, y, 2, 2);
    }

    // Skyline silhouettes with glowing windows
    const bldgs = [
      { x: 0, w: 90, h: 140 },
      { x: 95, w: 70, h: 180, name: 'BUGLE' },
      { x: 170, w: 100, h: 120 },
      { x: 275, w: 80, h: 210, name: 'OSCORP' },
      { x: 360, w: 110, h: 150 },
      { x: 475, w: 90, h: 190, name: 'STARK' },
      { x: 570, w: 120, h: 130 },
      { x: 695, w: 85, h: 175 },
      { x: 785, w: 95, h: 140 },
      { x: 885, w: 130, h: 160 }
    ];

    bldgs.forEach(b => {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(b.x, 256 - b.h, b.w, b.h);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, 256 - b.h, b.w, b.h);

      // Lit windows
      ctx.fillStyle = '#fef08a';
      for (let wy = 256 - b.h + 20; wy < 240; wy += 18) {
        for (let wx = b.x + 10; wx < b.x + b.w - 10; wx += 14) {
          if ((wx + wy) % 5 !== 0) {
            ctx.fillRect(wx, wy, 6, 8);
          }
        }
      }

      // Neon sign on building top
      if (b.name) {
        ctx.font = '900 18px "Bangers", Impact, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = b.name === 'BUGLE' ? '#ef4444' : b.name === 'OSCORP' ? '#22c55e' : '#38bdf8';
        ctx.fillText(b.name, b.x + b.w / 2, 256 - b.h + 16);
      }
    });

    const texture = new THREE.CanvasTexture(canvas);
    const backdropGeo = new THREE.CylinderGeometry(55, 55, 30, 32, 1, true);
    const backdropMat = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide
    });
    const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
    backdrop.position.y = 8;
    this.scene.add(backdrop);
  }

  update() {
    // Zero CPU overhead in update loop for maximum Pentium performance
  }
}
