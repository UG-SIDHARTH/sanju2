// ==========================================================================
// DICE 3D - Physical 3D Six-Sided Tumbling Dice with Pip Textures & Physics
// ==========================================================================

import * as THREE from 'three';

export class Dice3D {
  constructor(scene, audioManager) {
    this.scene = scene;
    this.audioManager = audioManager;
    this.diceSize = 1.2;
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
    this.mesh.visible = false; // Hidden until first roll
  }

  createPipTexture(value) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Ivory/white dice face
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 256, 256);

    // Subtle edge border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 246, 246);

    // Pip coordinates
    const pipRadius = 22;
    const pipColor = value === 1 ? '#e62429' : '#0f172a'; // Ace is Spidey Red!

    ctx.fillStyle = pipColor;

    const drawPip = (x, y) => {
      ctx.beginPath();
      ctx.arc(x, y, pipRadius, 0, Math.PI * 2);
      ctx.fill();
    };

    const c = 128;
    const l = 64;
    const r = 192;

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
    return texture;
  }

  buildDice() {
    // Cube faces in Three.js order: +X (2), -X (5), +Y (1), -Y (6), +Z (3), -Z (4)
    const faceValues = [2, 5, 1, 6, 3, 4];
    const materials = faceValues.map(val => {
      return new THREE.MeshStandardMaterial({
        map: this.createPipTexture(val),
        roughness: 0.25,
        metalness: 0.1
      });
    });

    const geo = new THREE.BoxGeometry(this.diceSize, this.diceSize, this.diceSize);
    const mesh = new THREE.Mesh(geo, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // Roll dice with realistic tumbling physics and bounces
  roll(targetValue, startPos, onComplete) {
    if (this.isRolling) return;
    this.isRolling = true;
    this.mesh.visible = true;

    const duration = 1.4; // 1.4s roll time
    const startTime = performance.now();

    // Start position: slightly in front of active player
    const spawnPos = startPos ? startPos.clone() : new THREE.Vector3(0, 0, 0);
    spawnPos.y = 1.0;
    this.mesh.position.copy(spawnPos);

    // Initial random angular tumbling velocities
    const spinX = (Math.PI * 4 + Math.random() * Math.PI * 2) * (Math.random() > 0.5 ? 1 : -1);
    const spinY = (Math.PI * 4 + Math.random() * Math.PI * 2) * (Math.random() > 0.5 ? 1 : -1);
    const spinZ = (Math.PI * 4 + Math.random() * Math.PI * 2) * (Math.random() > 0.5 ? 1 : -1);

    const targetEuler = this.targetFaceRotations[targetValue];

    let lastClickTime = 0;

    const animateRoll = () => {
      const now = performance.now();
      const progress = (now - startTime) / (duration * 1000);

      if (progress < 1.0) {
        // Tumble bounce height
        const bounce1 = Math.sin(progress * Math.PI * 3);
        const heightDecay = (1 - progress);
        const yOffset = Math.max(0, bounce1 * heightDecay * 3.5);
        this.mesh.position.y = spawnPos.y + yOffset + this.diceSize / 2;

        // Play click on floor bounces
        if (yOffset < 0.2 && now - lastClickTime > 200) {
          this.audioManager.playDiceClick();
          lastClickTime = now;
        }

        // Drifting along floor
        this.mesh.position.x = spawnPos.x + Math.sin(progress * Math.PI) * 1.5;
        this.mesh.position.z = spawnPos.z + Math.cos(progress * Math.PI) * 1.5;

        // Smoothly blend from wild tumbling into targetEuler
        if (progress < 0.7) {
          this.mesh.rotation.x += spinX * 0.02;
          this.mesh.rotation.y += spinY * 0.02;
          this.mesh.rotation.z += spinZ * 0.02;
        } else {
          // Final settle interpolation
          const settleT = (progress - 0.7) / 0.3;
          const easeSettle = Math.sin(settleT * Math.PI / 2);
          this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, targetEuler.x, easeSettle);
          this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, targetEuler.y, easeSettle);
          this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, targetEuler.z, easeSettle);
        }

        requestAnimationFrame(animateRoll);
      } else {
        // Roll finished!
        this.mesh.rotation.copy(targetEuler);
        this.mesh.position.y = spawnPos.y + this.diceSize / 2;
        this.audioManager.playDiceClick();
        this.isRolling = false;

        if (onComplete) onComplete(targetValue);
      }
    };

    requestAnimationFrame(animateRoll);
  }
}
