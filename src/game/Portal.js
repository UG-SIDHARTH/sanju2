// ==========================================================================
// PORTAL - Masterpiece Cinematic Quantum Multiverse Dimensional Rifts
// Swirling Accretion Disks, Orbiting Quantum Sparks & Dimensional Warp Physics
// ==========================================================================

import * as THREE from 'three';

export class Portal {
  constructor(scene, id, startTile, destTile, startPos, destPos, audioManager, comicFX, colorTheme = 'amber') {
    this.scene = scene;
    this.id = id;
    this.startTile = startTile;
    this.destTile = destTile;
    this.startPos = startPos.clone();
    this.destPos = destPos.clone();
    this.audioManager = audioManager;
    this.comicFX = comicFX;

    this.colorTheme = colorTheme; // 'amber', 'crimson', 'cyan', 'violet'
    this.colors = this.getThemeColors(colorTheme);

    this.animTime = Math.random() * 10;
    this.sparks = [];

    this.entranceGroup = new THREE.Group();
    this.entranceGroup.position.set(this.startPos.x, 1.2, this.startPos.z);
    this.scene.add(this.entranceGroup);

    this.exitGroup = new THREE.Group();
    this.exitGroup.position.set(this.destPos.x, 1.2, this.destPos.z);
    this.scene.add(this.exitGroup);

    this.buildPortalStructure(this.entranceGroup, true);
    this.buildPortalStructure(this.exitGroup, false);
  }

  getThemeColors(theme) {
    switch (theme) {
      case 'amber':
        return {
          primary: 0xf59e0b,
          core: 0xfef08a,
          glow: '#f59e0b',
          hexStr: '#f59e0b',
          name: 'GOLDEN MULTIVERSE RIFT'
        };
      case 'crimson':
        return {
          primary: 0xef4444,
          core: 0xfca5a5,
          glow: '#ef4444',
          hexStr: '#ef4444',
          name: 'CRIMSON VOID DISTORTION'
        };
      case 'cyan':
        return {
          primary: 0x06b6d4,
          core: 0xa5f3fc,
          glow: '#06b6d4',
          hexStr: '#06b6d4',
          name: 'QUANTUM WEB DIMENSION'
        };
      case 'violet':
      default:
        return {
          primary: 0x8b5cf6,
          core: 0xd8b4fe,
          glow: '#8b5cf6',
          hexStr: '#8b5cf6',
          name: 'COSMIC SINGULARITY'
        };
    }
  }

  // Procedural Swirling Galaxy Canvas Texture
  createVortexTexture(colors) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const cx = 256;
    const cy = 256;

    ctx.clearRect(0, 0, 512, 512);

    // Multiple swirling spiral arms
    const arms = 4;
    for (let arm = 0; arm < arms; arm++) {
      const baseAngle = (arm / arms) * Math.PI * 2;
      for (let r = 20; r < 240; r += 2) {
        const spiralAngle = baseAngle + (r * 0.035);
        const x = cx + Math.cos(spiralAngle) * r;
        const y = cy + Math.sin(spiralAngle) * r;

        const alpha = Math.sin((r / 240) * Math.PI) * 0.85;
        const width = 8 + (r * 0.04);

        ctx.fillStyle = colors.glow;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, width, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Outer luminous plasma ring
    ctx.globalAlpha = 0.9;
    const grad = ctx.createRadialGradient(cx, cy, 140, cx, cy, 230);
    grad.addColorStop(0, colors.glow);
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 230, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  buildPortalStructure(parentGroup, isEntrance) {
    // 1. Outer Dimensional Energy Ring
    const ringGeo = new THREE.TorusGeometry(0.95, 0.055, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: this.colors.primary,
      emissive: this.colors.primary,
      emissiveIntensity: 2.2,
      roughness: 0.1,
      metalness: 0.9
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    parentGroup.add(ringMesh);

    // 2. Swirling Accretion Disk (Front & Back)
    const vortexTex = this.createVortexTexture(this.colors);
    const diskGeo = new THREE.PlaneGeometry(1.9, 1.9);
    const diskMat = new THREE.MeshBasicMaterial({
      map: vortexTex,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const diskMesh = new THREE.Mesh(diskGeo, diskMat);
    parentGroup.add(diskMesh);

    if (isEntrance) {
      this.entranceDisk = diskMesh;
    } else {
      this.exitDisk = diskMesh;
    }

    // 3. Central Event Horizon Black Void
    const voidGeo = new THREE.CircleGeometry(0.48, 32);
    const voidMat = new THREE.MeshBasicMaterial({
      color: 0x030712,
      side: THREE.DoubleSide
    });
    const voidMesh = new THREE.Mesh(voidGeo, voidMat);
    voidMesh.position.z = 0.01;
    parentGroup.add(voidMesh);

    // 4. Ground Teleport Halo on Tile
    const haloGeo = new THREE.RingGeometry(0.75, 0.98, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: this.colors.primary,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = -Math.PI / 2;
    haloMesh.position.set(0, -1.16, 0);
    parentGroup.add(haloMesh);

    // 5. Orbiting Quantum Spark Particles
    const sparkCount = 28;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkAngles = [];
    const sparkRadii = [];
    const sparkSpeeds = [];

    for (let i = 0; i < sparkCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.88 + Math.random() * 0.22;
      sparkAngles.push(a);
      sparkRadii.push(r);
      sparkSpeeds.push(2.5 + Math.random() * 2.5);

      sparkPositions[i * 3 + 0] = Math.cos(a) * r;
      sparkPositions[i * 3 + 1] = Math.sin(a) * r;
      sparkPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));

    const sparkMat = new THREE.PointsMaterial({
      color: this.colors.core,
      size: 0.16,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    parentGroup.add(sparkPoints);

    this.sparks.push({
      points: sparkPoints,
      geo: sparkGeo,
      angles: sparkAngles,
      radii: sparkRadii,
      speeds: sparkSpeeds,
      count: sparkCount
    });

    parentGroup.rotation.y = 0;
  }

  // --- INSANE DIMENSIONAL WARP ANIMATION ---
  warpPlayer(player, onCameraTrack, onComplete) {
    if (!player || !player.root) {
      if (onComplete) onComplete();
      return;
    }

    const startP = this.entranceGroup.position.clone();
    const destP = this.exitGroup.position.clone();
    const groundDest = this.destPos.clone();

    // 1. Audio: Resonant dimensional warp frequency sweep
    if (this.audioManager?.playPortalEnter) {
      this.audioManager.playPortalEnter();
    }

    // 2. Cinematic Banner
    if (this.comicFX?.showBanner) {
      this.comicFX.showBanner(`🌀 ${this.colors.name}: TILE ${this.startTile} ➔ TILE ${this.destTile}!`);
    }

    const origScale = player.root.scale.clone();
    const startTime = performance.now();
    const phase1Duration = 650;
    const phase2Duration = 700;
    const phase3Duration = 650;

    if (player.animator) {
      player.animator.setState('jump');
    }

    // Phase 1: Gravitational suction into portal center
    const animateSuction = () => {
      const now = performance.now();
      const p = Math.min(1.0, (now - startTime) / phase1Duration);

      player.root.position.lerpVectors(this.startPos, startP, p);
      player.root.rotation.y += 0.25;
      player.root.rotation.z += 0.15;

      const s = Math.max(0.01, 1.0 - p);
      player.root.scale.set(s * 0.4, s * 1.6, s * 0.4);

      if (this.entranceDisk) {
        this.entranceDisk.scale.set(1.0 + p * 0.4, 1.0 + p * 0.4, 1.0);
      }

      if (onCameraTrack) {
        onCameraTrack(startP, destP, p * 0.3);
      }

      if (p < 1.0) {
        requestAnimationFrame(animateSuction);
      } else {
        player.root.visible = false;
        if (this.entranceDisk) this.entranceDisk.scale.set(1.0, 1.0, 1.0);
        startTransit();
      }
    };

    // Phase 2: Dimensional wormhole camera transit
    const startTransit = () => {
      const transitStart = performance.now();

      const animateTransit = () => {
        const now = performance.now();
        const p = Math.min(1.0, (now - transitStart) / phase2Duration);

        if (onCameraTrack) {
          onCameraTrack(startP, destP, 0.3 + p * 0.4);
        }

        if (p < 1.0) {
          requestAnimationFrame(animateTransit);
        } else {
          startEmergence();
        }
      };

      requestAnimationFrame(animateTransit);
    };

    // Phase 3: Explosive emergence from exit portal
    const startEmergence = () => {
      player.root.position.copy(destP);
      player.root.visible = true;
      player.root.rotation.set(0, 0, 0);

      if (this.audioManager?.playPortalExit) {
        this.audioManager.playPortalExit();
      }

      const emergeStart = performance.now();

      const animateEmergence = () => {
        const now = performance.now();
        const p = Math.min(1.0, (now - emergeStart) / phase3Duration);

        if (this.exitDisk) {
          const flare = 1.0 + Math.sin(p * Math.PI) * 0.5;
          this.exitDisk.scale.set(flare, flare, 1.0);
        }

        player.root.position.lerpVectors(destP, groundDest, p);

        const easeOutBack = (t) => {
          const c1 = 1.70158;
          const c3 = c1 + 1;
          return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        };
        const s = Math.min(1.0, easeOutBack(p));
        player.root.scale.set(origScale.x * s, origScale.y * s, origScale.z * s);

        if (onCameraTrack) {
          onCameraTrack(startP, destP, 0.7 + p * 0.3);
        }

        if (p < 1.0) {
          requestAnimationFrame(animateEmergence);
        } else {
          player.root.position.copy(groundDest);
          player.root.scale.copy(origScale);
          player.root.rotation.set(0, 0, 0);

          if (this.exitDisk) this.exitDisk.scale.set(1.0, 1.0, 1.0);

          if (player.animator) {
            player.animator.setState('idle');
          }

          player.currentTile = this.destTile;

          if (onComplete) {
            onComplete();
          }
        }
      };

      requestAnimationFrame(animateEmergence);
    };

    requestAnimationFrame(animateSuction);
  }

  update(delta) {
    this.animTime += delta;

    if (this.entranceDisk) {
      this.entranceDisk.rotation.z += delta * 2.8;
    }
    if (this.exitDisk) {
      this.exitDisk.rotation.z -= delta * 2.8;
    }

    const floatOffset = Math.sin(this.animTime * 2.2) * 0.08;
    this.entranceGroup.position.y = 1.2 + floatOffset;
    this.exitGroup.position.y = 1.2 + Math.cos(this.animTime * 2.2) * 0.08;

    this.sparks.forEach(sp => {
      const positions = sp.geo.attributes.position.array;
      for (let i = 0; i < sp.count; i++) {
        sp.angles[i] += delta * sp.speeds[i];
        const a = sp.angles[i];
        const r = sp.radii[i] + Math.sin(this.animTime * 4 + i) * 0.04;

        positions[i * 3 + 0] = Math.cos(a) * r;
        positions[i * 3 + 1] = Math.sin(a) * r;
        positions[i * 3 + 2] = Math.sin(a * 2 + this.animTime) * 0.12;
      }
      sp.geo.attributes.position.needsUpdate = true;
    });
  }

  dispose() {
    this.scene.remove(this.entranceGroup);
    this.scene.remove(this.exitGroup);
  }
}
