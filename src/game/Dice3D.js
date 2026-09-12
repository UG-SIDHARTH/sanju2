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
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  getTargetQuaternion(targetValue, randomYaw) {
    const baseQuat = new THREE.Quaternion();
    switch (targetValue) {
      case 1:
        baseQuat.set(0, 0, 0, 1);
        break;
      case 6:
        baseQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
        break;
      case 2:
        baseQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        break;
      case 5:
        baseQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
        break;
      case 3:
        baseQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        break;
      case 4:
        baseQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        break;
      default:
        baseQuat.set(0, 0, 0, 1);
    }

    const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), randomYaw);
    return yawQuat.multiply(baseQuat);
  }

  // Organic, physically randomized 3D tumbling roll with unpredictable physics
  roll(targetValue, startPos, onComplete) {
    if (this.isRolling) return;
    this.isRolling = true;
    this.mesh.visible = true;

    // Completely randomized throw timing & physical dynamics
    const duration = 1.35 + Math.random() * 0.35; // 1.35 to 1.7s
    const startTime = performance.now();

    const spawnPos = startPos ? startPos.clone() : new THREE.Vector3(0, 0, 0);
    spawnPos.y = 1.4;

    // Random throw direction & impulse across 360 degrees
    const launchAngle = Math.random() * Math.PI * 2;
    const launchDistance = 1.8 + Math.random() * 2.2;
    const peakHeight = 3.2 + Math.random() * 1.8;

    // Multi-axis high-speed tumbling spin with randomized axis impulses
    const spins = 5 + Math.floor(Math.random() * 4);
    const dirX = Math.random() > 0.5 ? 1 : -1;
    const dirY = Math.random() > 0.5 ? 1 : -1;
    const dirZ = Math.random() > 0.5 ? 1 : -1;

    const spinX = (Math.PI * 2 * spins + Math.random() * Math.PI * 2) * dirX;
    const spinY = (Math.PI * 2 * spins + Math.random() * Math.PI * 2) * dirY;
    const spinZ = (Math.PI * 2 * (spins - 1) + Math.random() * Math.PI * 2) * dirZ;

    // Random resting yaw angle (any of 360 degrees) so it never lands in a canned square position
    const randomYaw = (Math.random() * Math.PI * 2);
    const targetQuat = this.getTargetQuaternion(targetValue, randomYaw);

    let startSettleQuat = null;
    let lastBounceTime = 0;

    const animateRoll = () => {
      const now = performance.now();
      const progress = (now - startTime) / (duration * 1000);

      if (progress < 1.0) {
        // Multi-bounce parabolic trajectory with physical decay
        const bounceCount = 4.0;
        const bounce1 = Math.abs(Math.sin(progress * Math.PI * bounceCount));
        const decay = Math.pow(1.0 - progress, 1.5);
        const yOffset = bounce1 * decay * peakHeight;
        this.mesh.position.y = 0.1 + this.diceSize / 2 + yOffset;

        // Sound on floor impact
        if (yOffset < 0.28 && now - lastBounceTime > 160) {
          this.audioManager.playDiceClick();
          lastBounceTime = now;
        }

        // Drifting along random throw vector
        const travelT = Math.sin(progress * Math.PI / 2);
        this.mesh.position.x = spawnPos.x + Math.cos(launchAngle) * launchDistance * travelT;
        this.mesh.position.z = spawnPos.z + Math.sin(launchAngle) * launchDistance * travelT;

        // Dynamic chaotic tumbling that organically settles onto the face
        if (progress < 0.60) {
          const deltaSpin = 0.024;
          const spinDeltaEuler = new THREE.Euler(spinX * deltaSpin, spinY * deltaSpin, spinZ * deltaSpin);
          const spinDeltaQuat = new THREE.Quaternion().setFromEuler(spinDeltaEuler);
          this.mesh.quaternion.multiply(spinDeltaQuat);
        } else {
          if (!startSettleQuat) {
            startSettleQuat = this.mesh.quaternion.clone();
          }
          // Smooth spherical slerp settle onto the exact target face
          const settleT = (progress - 0.60) / 0.40;
          const ease = settleT * settleT * (3.0 - 2.0 * settleT); // Smoothstep
          this.mesh.quaternion.slerpQuaternions(startSettleQuat, targetQuat, ease);
        }

        requestAnimationFrame(animateRoll);
      } else {
        this.mesh.quaternion.copy(targetQuat);
        this.mesh.position.y = 0.1 + this.diceSize / 2;
        this.audioManager.playDiceClick();
        this.isRolling = false;

        if (onComplete) onComplete(targetValue);
      }
    };

    requestAnimationFrame(animateRoll);
  }
}
