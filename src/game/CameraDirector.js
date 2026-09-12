// ==========================================================================
// CAMERA DIRECTOR - High-Clarity 2.5D / Isometric Cinematic Camera
// Full aerial flight tracking, Spidey action framing & board overview
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
    this.targetPosition = new THREE.Vector3(0, 26, 26);
    this.targetLookAt = new THREE.Vector3(0, 0, 0);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);

    this.posDamp = 3.5;
    this.lookDamp = 4.5;

    this.zoomLevel = 1.0;
    this.targetZoomLevel = 1.0;
    this.minZoom = 0.35;
    this.maxZoom = 2.4;

    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };
    this.orbitAngleX = 0;
    this.orbitAngleY = 0;
    this.prevPinchDist = null;

    this.setupControls();
  }

  setupControls() {
    const onPointerDown = (e) => {
      if (e.touches && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        this.prevPinchDist = Math.hypot(dx, dy);
        return;
      }
      this.isDragging = true;
      this.prevMouse.x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      this.prevMouse.y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    };

    const onPointerMove = (e) => {
      // Handle 2-finger touch pinch zoom
      if (e.touches && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (this.prevPinchDist) {
          const ratio = this.prevPinchDist / dist;
          this.setZoom(this.targetZoomLevel * (1 + (ratio - 1) * 0.8));
        }
        this.prevPinchDist = dist;
        return;
      }

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
      this.prevPinchDist = null;
    };

    // Smooth Mouse Wheel Zoom
    const onWheel = (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.12 : 0.88;
      this.setZoom(this.targetZoomLevel * factor);
    };

    this.domElement.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    this.domElement.addEventListener('wheel', onWheel, { passive: false });
  }

  zoomIn() {
    this.setZoom(this.targetZoomLevel * 0.82);
  }

  zoomOut() {
    this.setZoom(this.targetZoomLevel * 1.22);
  }

  resetZoom() {
    this.setZoom(1.0);
  }

  setZoom(val) {
    this.targetZoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, val));
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
      this.targetPosition.set(0, 36, 1);
      this.targetLookAt.set(0, 0, 0);
    } else if (this.mode === CAMERA_MODES.CLOSEUP) {
      this.targetPosition.set(0, 16, 18);
      this.targetLookAt.set(0, 0, 0);
    } else {
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

  // --- PEAK CINEMATIC CLOSE-UP: SPIDER-MAN WEB PULL ---
  focusOnSpiderManAction(spideyPos, mjPos, phase = 'start') {
    if (phase === 'start') {
      // Dramatic over-the-shoulder close-up behind Spider-Man looking at MJ
      const dir = new THREE.Vector3().subVectors(mjPos, spideyPos).normalize();
      const right = new THREE.Vector3(-dir.z, 0, dir.x).normalize();

      // Position camera closely behind and slightly to the side of Spider-Man
      const camPos = spideyPos.clone()
        .addScaledVector(dir, -3.2)
        .addScaledVector(right, 1.2);
      camPos.y += 2.2;

      this.targetPosition.copy(camPos);
      this.targetLookAt.set(mjPos.x, mjPos.y + 1.2, mjPos.z);
      this.posDamp = 8.0;
      this.lookDamp = 8.5;
    } else {
      // Dynamic medium close-up framing both Spider-Man and MJ team-up
      const midpoint = new THREE.Vector3().addVectors(spideyPos, mjPos).multiplyScalar(0.5);
      this.targetPosition.set(midpoint.x, midpoint.y + 3.8, midpoint.z + 5.5);
      this.targetLookAt.set(midpoint.x, midpoint.y + 1.2, midpoint.z);
      this.posDamp = 6.0;
      this.lookDamp = 6.5;
    }
  }

  // --- PEAK CINEMATIC CLOSE-UP: GREEN GOBLIN KIDNAPPING & FLIGHT ---
  trackFlyingGoblin(goblinPos, destinationPos, progress = 0) {
    if (progress < 0.15) {
      // Intense close-up on Goblin grabbing MJ onto hoverboard
      this.targetPosition.set(goblinPos.x + 2.4, goblinPos.y + 2.0, goblinPos.z + 3.6);
      this.targetLookAt.set(goblinPos.x, goblinPos.y + 0.5, goblinPos.z);
      this.posDamp = 9.0;
      this.lookDamp = 9.5;
    } else if (progress < 0.85) {
      // Tight aerial chase camera tracking closely behind hoverboard glider
      const flightDir = new THREE.Vector3().subVectors(destinationPos, goblinPos).normalize();
      const camPos = goblinPos.clone().addScaledVector(flightDir, -4.5);
      camPos.y = Math.max(goblinPos.y + 2.8, 6.0);
      camPos.x += Math.sin(progress * Math.PI * 4) * 0.8; // subtle dynamic camera sway

      this.targetPosition.copy(camPos);
      this.targetLookAt.set(goblinPos.x, goblinPos.y - 0.2, goblinPos.z);
      this.posDamp = 7.5;
      this.lookDamp = 8.0;
    } else {
      // Tight touchdown landing shot on the safe drop tile
      this.targetPosition.set(destinationPos.x, destinationPos.y + 2.8, destinationPos.z + 5.2);
      this.targetLookAt.set(destinationPos.x, destinationPos.y + 0.8, destinationPos.z);
      this.posDamp = 7.0;
      this.lookDamp = 7.5;
    }
  }

  focusOnDestinationTile(destPos) {
    this.targetPosition.set(destPos.x, destPos.y + 2.8, destPos.z + 5.0);
    this.targetLookAt.set(destPos.x, destPos.y + 0.8, destPos.z);
    this.posDamp = 6.5;
    this.lookDamp = 7.0;
  }

  // Dynamic cinematic dimensional camera tracking for Quantum Portal Warp
  trackPortalWarp(startPos, destPos, progress = 0) {
    const p = Math.min(1.0, Math.max(0.0, progress));

    if (p < 0.3) {
      // Close-up on entrance portal
      this.targetPosition.set(startPos.x, startPos.y + 3.2, startPos.z + 4.8);
      this.targetLookAt.set(startPos.x, startPos.y + 1.2, startPos.z);
    } else if (p < 0.7) {
      // High-speed wormhole transit arc
      const transitP = (p - 0.3) / 0.4;
      const curMid = new THREE.Vector3().lerpVectors(startPos, destPos, transitP);
      this.targetPosition.set(curMid.x, curMid.y + 9.0, curMid.z + 8.0);
      this.targetLookAt.set(curMid.x, curMid.y + 1.2, curMid.z);
    } else {
      // Close-up on exit portal emergence
      this.targetPosition.set(destPos.x, destPos.y + 3.2, destPos.z + 4.8);
      this.targetLookAt.set(destPos.x, destPos.y + 0.8, destPos.z);
    }

    this.posDamp = 7.5;
    this.lookDamp = 8.0;
  }

  focusOnTile100(tile100Pos) {
    this.targetPosition.set(tile100Pos.x, tile100Pos.y + 3.5, tile100Pos.z + 6.2);
    this.targetLookAt.set(tile100Pos.x, tile100Pos.y + 1.2, tile100Pos.z);
  }

  update(delta) {
    this.zoomLevel = THREE.MathUtils.lerp(this.zoomLevel, this.targetZoomLevel, delta * 7.0);

    // Scale offset from targetLookAt by zoomLevel
    const offset = new THREE.Vector3()
      .subVectors(this.targetPosition, this.targetLookAt)
      .multiplyScalar(this.zoomLevel);
    const basePos = new THREE.Vector3().addVectors(this.targetLookAt, offset);

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
