// ==========================================================================
// DICE 3D - Physical 3D Six-Sided Tumbling Dice with High-Entropy Physics
// Completely unpredictable organic tumble, variable trajectory & bounces
// ==========================================================================

import * as THREE from 'three';

export class Dice3D {
  constructor(scene, audioManager) {
    this.scene = scene;
    this.audioManager = audioManager;
    this.diceSize = 1.3;
    this.isRolling = false;

    this.targetFaceRotations = {
      1: new THREE.Euler(0, 0, 0),
      6: new THREE.Euler(Math.PI, 0, 0),
      2: new THREE.Euler(0, 0, Math.PI / 2),
      5: new THREE.Euler(0, 0, -Math.PI / 2),
      3: new THREE.Euler(-Math.PI / 2, 0, 0),
      4: new THREE.Euler(Math.PI / 2, 0, 0)
    };

    this.mesh = this.buildDice();
    this.scene.add(this.mesh);
    this.mesh.visible = false;
  }

  createPipTexture(value) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Ivory/white dice face with subtle gradient
    const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 300);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Beveled edge border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 20;
    ctx.strokeRect(10, 10, 492, 492);

    const pipRadius = 44;
    const pipColor = value === 1 ? '#ef4444' : '#0f172a'; // Ace is Spidey Red!

    const drawPip = (x, y) => {
      ctx.save();
      // Drop shadow in pip
      ctx.beginPath();
      ctx.arc(x, y + 4, pipRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fill();

      // Main pip
      ctx.beginPath();
      ctx.arc(x, y, pipRadius, 0, Math.PI * 2);
      ctx.fillStyle = pipColor;
      ctx.fill();
      ctx.restore();
    };

    const c = 256;
    const l = 128;
    const r = 384;

    switch (value) {
      case 1:
        drawPip(c, c);
        break;
      case 2:
        drawPip(l, l);
        drawPip(r, r);
        break;
      case 3:
        drawPip(l, l);
        drawPip(c, c);
        drawPip(r, r);
        break;
      case 4:
        drawPip(l, l);
        drawPip(r, l);
        drawPip(l, r);
        drawPip(r, r);
        break;
      case 5:
        drawPip(l, l);
        drawPip(r, l);
        drawPip(c, c);
        drawPip(l, r);
        drawPip(r, r);
        break;
      case 6:
        drawPip(l, l);
        drawPip(r, l);
        drawPip(l, c);
        drawPip(r, c);
        drawPip(l, r);
        drawPip(r, r);
        break;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  buildDice() {
    const faceValues = [2, 5, 1, 6, 3, 4];
    const materials = faceValues.map(val => {
      return new THREE.MeshLambertMaterial({
        map: this.createPipTexture(val)
      });
    });

    const geo = new THREE.BoxGeometry(this.diceSize, this.diceSize, this.diceSize);
    const mesh = new THREE.Mesh(geo, materials);
    return mesh;
  }

  // Organic, physically randomized 3D tumbling roll
  roll(targetValue, startPos, onComplete) {
    if (this.isRolling) return;
    this.isRolling = true;
    this.mesh.visible = true;

    // Completely randomized physics parameters for this specific throw
    const duration = 1.3 + Math.random() * 0.3; // 1.3 to 1.6s
    const startTime = performance.now();

    const spawnPos = startPos ? startPos.clone() : new THREE.Vector3(0, 0, 0);
    spawnPos.y = 1.2;

    // Random throw direction & impulse
    const launchAngle = Math.random() * Math.PI * 2;
    const launchDistance = 1.5 + Math.random() * 2.0;
    const peakHeight = 2.8 + Math.random() * 1.6;

    // Multi-axis high-speed tumbling spin
    const spins = 4 + Math.floor(Math.random() * 4); // 4 to 7 full rotations
    const dirX = Math.random() > 0.5 ? 1 : -1;
    const dirY = Math.random() > 0.5 ? 1 : -1;
    const dirZ = Math.random() > 0.5 ? 1 : -1;

    const spinX = (Math.PI * 2 * spins + Math.random() * Math.PI) * dirX;
    const spinY = (Math.PI * 2 * spins + Math.random() * Math.PI) * dirY;
    const spinZ = (Math.PI * 2 * (spins - 1) + Math.random() * Math.PI) * dirZ;

    const targetEuler = this.targetFaceRotations[targetValue];
    let lastBounceTime = 0;

    const animateRoll = () => {
      const now = performance.now();
      const progress = (now - startTime) / (duration * 1000);

      if (progress < 1.0) {
        // Multi-bounce parabolic trajectory
        const bounce1 = Math.abs(Math.sin(progress * Math.PI * 3.5));
        const decay = Math.pow(1 - progress, 1.4);
        const yOffset = bounce1 * decay * peakHeight;
        this.mesh.position.y = 0.1 + this.diceSize / 2 + yOffset;

        // Sound on floor impact
        if (yOffset < 0.25 && now - lastBounceTime > 180) {
          this.audioManager.playDiceClick();
          lastBounceTime = now;
        }

        // Drifting along random throw vector
        const travelT = Math.sin(progress * Math.PI / 2);
        this.mesh.position.x = spawnPos.x + Math.cos(launchAngle) * launchDistance * travelT;
        this.mesh.position.z = spawnPos.z + Math.sin(launchAngle) * launchDistance * travelT;

        // Dynamic chaotic tumbling that organically settles onto the face
        if (progress < 0.65) {
          this.mesh.rotation.x += spinX * 0.022;
          this.mesh.rotation.y += spinY * 0.022;
          this.mesh.rotation.z += spinZ * 0.022;
        } else {
          // Smooth ease settle
          const settleT = (progress - 0.65) / 0.35;
          const ease = Math.sin(settleT * Math.PI / 2);
          this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, targetEuler.x, ease);
          this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, targetEuler.y, ease);
          this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, targetEuler.z, ease);
        }

        requestAnimationFrame(animateRoll);
      } else {
        this.mesh.rotation.copy(targetEuler);
        this.mesh.position.y = 0.1 + this.diceSize / 2;
        this.audioManager.playDiceClick();
        this.isRolling = false;

        if (onComplete) onComplete(targetValue);
      }
    };

    requestAnimationFrame(animateRoll);
  }
}
