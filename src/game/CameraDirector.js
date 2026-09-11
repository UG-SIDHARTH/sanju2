// ==========================================================================
// CAMERA DIRECTOR - High-Clarity 2.5D / Isometric Cinematic Camera
// ==========================================================================

import * as THREE from 'three';

export const CAMERA_MODES = {
  CINEMATIC: 'cinematic',
  OVERVIEW: 'overview',
  CLOSEUP: 'closeup'
};

export class CameraDirector {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.mode = CAMERA_MODES.CINEMATIC;
    // Crisp elevated angle (peak visibility across all 100 tiles)
    this.targetPosition = new THREE.Vector3(0, 26, 26);
    this.targetLookAt = new THREE.Vector3(0, 0, 0);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);

    this.posDamp = 3.5;
    this.lookDamp = 4.5;

    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };
    this.orbitAngleX = 0;
    this.orbitAngleY = 0;

    this.setupControls();
  }

  setupControls() {
    const onPointerDown = (e) => {
      this.isDragging = true;
      this.prevMouse.x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      this.prevMouse.y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const dx = x - this.prevMouse.x;
      const dy = y - this.prevMouse.y;

      this.orbitAngleX -= dx * 0.005;
      this.orbitAngleY = Math.max(-0.4, Math.min(0.6, this.orbitAngleY + dy * 0.005));

      this.prevMouse.x = x;
      this.prevMouse.y = y;
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    this.domElement.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });
  }

  setMode(newMode) {
    this.mode = newMode;
    this.orbitAngleX = 0;
    this.orbitAngleY = 0;
  }

  toggleMode() {
    if (this.mode === CAMERA_MODES.CINEMATIC) {
      this.setMode(CAMERA_MODES.OVERVIEW);
    } else if (this.mode === CAMERA_MODES.OVERVIEW) {
      this.setMode(CAMERA_MODES.CLOSEUP);
    } else {
      this.setMode(CAMERA_MODES.CINEMATIC);
    }
    return this.mode;
  }

  focusOnBoard() {
    if (this.mode === CAMERA_MODES.OVERVIEW) {
      // Direct Top-Down 2D board perspective
      this.targetPosition.set(0, 36, 1);
      this.targetLookAt.set(0, 0, 0);
    } else if (this.mode === CAMERA_MODES.CLOSEUP) {
      this.targetPosition.set(0, 16, 18);
      this.targetLookAt.set(0, 0, 0);
    } else {
      // 2.5D Clear Isometric View
      this.targetPosition.set(0, 26, 25);
      this.targetLookAt.set(0, 0.5, 0);
    }
  }

  focusOnPlayer(playerPos) {
    if (this.mode === CAMERA_MODES.OVERVIEW) {
      this.targetPosition.set(0, 36, 1);
      this.targetLookAt.set(0, 0, 0);
      return;
    }

    const dist = this.mode === CAMERA_MODES.CLOSEUP ? 12 : 18;
    const height = this.mode === CAMERA_MODES.CLOSEUP ? 10 : 16;

    this.targetPosition.set(playerPos.x, playerPos.y + height, playerPos.z + dist);
    this.targetLookAt.copy(playerPos);
    this.targetLookAt.y += 0.8;
  }

  // Framing both Spider-Man and MJ clearly during the web pull
  focusOnSpiderManAction(spideyPos, mjPos) {
    const midpoint = new THREE.Vector3().addVectors(spideyPos, mjPos).multiplyScalar(0.5);
    const spanDist = spideyPos.distanceTo(mjPos);
    const camDist = Math.max(16, spanDist * 1.2);

    this.targetPosition.set(midpoint.x, midpoint.y + 14, midpoint.z + camDist);
    this.targetLookAt.copy(midpoint);
    this.targetLookAt.y += 1.2;
  }

  // Framing Green Goblin and MJ during aerial kidnapping
  focusOnGoblinAction(goblinPos, mjPos) {
    this.targetPosition.set(goblinPos.x + 8, goblinPos.y + 16, goblinPos.z + 18);
    this.targetLookAt.copy(goblinPos);
  }

  focusOnTile100(tile100Pos) {
    this.targetPosition.set(tile100Pos.x, tile100Pos.y + 4.0, tile100Pos.z + 8.0);
    this.targetLookAt.set(tile100Pos.x, tile100Pos.y + 1.2, tile100Pos.z);
  }

  update(delta) {
    const basePos = this.targetPosition.clone();

    if (this.orbitAngleX !== 0 || this.orbitAngleY !== 0) {
      const radius = basePos.distanceTo(this.targetLookAt);
      const angleY = Math.atan2(basePos.x - this.targetLookAt.x, basePos.z - this.targetLookAt.z) + this.orbitAngleX;
      basePos.x = this.targetLookAt.x + Math.sin(angleY) * radius;
      basePos.z = this.targetLookAt.z + Math.cos(angleY) * radius;
      basePos.y += this.orbitAngleY * 10;
    }

    this.camera.position.lerp(basePos, delta * this.posDamp);
    this.currentLookAt.lerp(this.targetLookAt, delta * this.lookDamp);
    this.camera.lookAt(this.currentLookAt);
  }
}
