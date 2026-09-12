// ==========================================================================
// PORTAL - Masterpiece Dark Cosmic Void & Quantum Multiverse Dimensional Rifts
// Dark Obsidian Singularity, Swirling Shadow Matter, Vanishing & Appearing VFX
// ==========================================================================

import * as THREE from 'three';

export class Portal {
  constructor(scene, id, startTile, destTile, startPos, destPos, audioManager, comicFX, colorTheme = 'dark_void') {
    this.scene = scene;
    this.id = id;
    this.startTile = startTile;
    this.destTile = destTile;
    this.startPos = startPos.clone();
    this.destPos = destPos.clone();
    this.audioManager = audioManager;
    this.comicFX = comicFX;

    this.colorTheme = colorTheme;
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

    // Initial Cool Dark Spawning / Appearing Animation
    this.playSpawnAppearance();
  }

  getThemeColors(theme) {
    switch (theme) {
      case 'dark_crimson':
        return {
          primary: 0x881337,
          core: 0xf43f5e,
          glow: '#e11d48',
          shadow: '#1e050c',
          hexStr: '#f43f5e',
          name: 'DARK CRIMSON VOID RIFT'
        };
      case 'dark_void':
      default:
        return {
          primary: 0x3b0764, // Dark Cosmic Obsidian Violet
          core: 0xa855f7,    // Glowing Purple Singularity
          glow: '#7c3aed',
          shadow: '#030712', // Pure Black Event Horizon
          hexStr: '#a855f7',
          name: 'DARK QUANTUM SINGULARITY'
        };
    }
  }

  // Swirling Dark Matter Galaxy Canvas Texture
  createDarkVortexTexture(colors) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const cx = 256;
    const cy = 256;
    ctx.clearRect(0, 0, 512, 512);

    // Dark Nebula Shadow Base
    const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 250);
    bgGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    bgGrad.addColorStop(0.5, 'rgba(15, 7, 30, 0.9)');
    bgGrad.addColorStop(0.85, colors.shadow);
    bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 250, 0, Math.PI * 2);
    ctx.fill();

    // Dark swirling spiral tendrils
    const arms = 5;
    for (let arm = 0; arm < arms; arm++) {
      const baseAngle = (arm / arms) * Math.PI * 2;
      for (let r = 25; r < 240; r += 2) {
        const spiralAngle = baseAngle + (r * 0.042);
        const x = cx + Math.cos(spiralAngle) * r;
        const y = cy + Math.sin(spiralAngle) * r;

        const alpha = Math.sin((r / 240) * Math.PI) * 0.9;
        const width = 10 + (r * 0.05);

        ctx.fillStyle = colors.glow;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, width, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Outer Dark Lightning Flare
    ctx.globalAlpha = 0.95;
    const flareGrad = ctx.createRadialGradient(cx, cy, 120, cx, cy, 240);
    flareGrad.addColorStop(0, colors.glow);
    flareGrad.addColorStop(0.65, 'rgba(168, 85, 247, 0.85)');
    flareGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = flareGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 240, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  buildPortalStructure(parentGroup, isEntrance) {
    // 1. Dark Energy Outer Ring
    const ringGeo = new THREE.TorusGeometry(1.02, 0.065, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x18062b,
      emissive: this.colors.core,
      emissiveIntensity: 1.8,
      roughness: 0.2,
      metalness: 0.95
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    parentGroup.add(ringMesh);

    // 2. Swirling Dark Accretion Disk
    const vortexTex = this.createDarkVortexTexture(this.colors);
    const diskGeo = new THREE.PlaneGeometry(2.1, 2.1);
    const diskMat = new THREE.MeshBasicMaterial({
      map: vortexTex,
      transparent: true,
      opacity: 0.94,
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

    // 3. Central Pure Obsidian Event Horizon (Deep Black Void)
    const voidGeo = new THREE.CircleGeometry(0.52, 32);
    const voidMat = new THREE.MeshBasicMaterial({
      color: 0x020308,
      side: THREE.DoubleSide
    });
    const voidMesh = new THREE.Mesh(voidGeo, voidMat);
    voidMesh.position.z = 0.012;
    parentGroup.add(voidMesh);

    // 4. Ground Teleport Shadow Ring on Tile
    const haloGeo = new THREE.RingGeometry(0.75, 1.05, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: this.colors.primary,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = -Math.PI / 2;
    haloMesh.position.set(0, -1.16, 0);
    parentGroup.add(haloMesh);

    // 5. Dark Matter Spark Particles
    const sparkCount = 32;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkAngles = [];
    const sparkRadii = [];
    const sparkSpeeds = [];

    for (let i = 0; i < sparkCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.82 + Math.random() * 0.35;
      sparkAngles.push(a);
      sparkRadii.push(r);
      sparkSpeeds.push(2.2 + Math.random() * 2.8);

      sparkPositions[i * 3 + 0] = Math.cos(a) * r;
      sparkPositions[i * 3 + 1] = Math.sin(a) * r;
      sparkPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.28;
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));

    const sparkMat = new THREE.PointsMaterial({
      color: this.colors.core,
      size: 0.18,
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
  }

  // Cool Dark Materialize / Appearing Animation at Match Start
  playSpawnAppearance() {
    this.entranceGroup.scale.set(0.01, 0.01, 0.01);
    this.exitGroup.scale.set(0.01, 0.01, 0.01);

    const startTime = performance.now();
    const duration = 1200; // 1.2s smooth dark pop-in

    const animateSpawn = () => {
      const now = performance.now();
      const p = Math.min(1.0, (now - startTime) / duration);

      // Elastic ease-out
      const s = p === 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
      this.entranceGroup.scale.set(s, s, s);
      this.exitGroup.scale.set(s, s, s);

      if (p < 1.0) {
        requestAnimationFrame(animateSpawn);
      } else {
        this.entranceGroup.scale.set(1, 1, 1);
        this.exitGroup.scale.set(1, 1, 1);
      }
    };

    requestAnimationFrame(animateSpawn);
  }

  // Vanishing & Reappearing Pulse during gameplay
  playVanishAndReappear(targetGroup, onMidpoint, onDone) {
    const startTime = performance.now();
    const duration = 900;

    const animate = () => {
      const now = performance.now();
      const p = Math.min(1.0, (now - startTime) / duration);

      if (p < 0.5) {
        // Vanishing into singularity
        const vanishP = p / 0.5;
        const s = Math.max(0.01, 1.0 - vanishP);
        targetGroup.scale.set(s * 0.2, s * 1.5, s * 0.2);
        if (p >= 0.48 && onMidpoint) {
          onMidpoint();
          onMidpoint = null;
        }
      } else {
        // Reappearing explosive emergence
        const appearP = (p - 0.5) / 0.5;
        const s = Math.min(1.0, 1.0 + Math.sin(appearP * Math.PI) * 0.4);
        targetGroup.scale.set(s, s, s);
      }

      if (p < 1.0) {
        requestAnimationFrame(animate);
      } else {
        targetGroup.scale.set(1, 1, 1);
        if (onDone) onDone();
      }
    };

    requestAnimationFrame(animate);
  }

  hasTile(tileNum) {
    return tileNum === this.startTile || tileNum === this.destTile;
  }

  getDestination(fromTile) {
    if (fromTile === this.startTile) return this.destTile;
    if (fromTile === this.destTile) return this.startTile;
    return null;
  }

  // --- BIDIRECTIONAL DARK VOID WARP WITH VANISHING & APPEARING ANIMATION ---
  warpPlayer(player, fromTile = null, onCameraTrack = null, onComplete = null) {
    if (!player || !player.root) {
      if (onComplete) onComplete();
      return;
    }

    const isReverse = fromTile === this.destTile;
    const originTile = isReverse ? this.destTile : this.startTile;
    const targetTile = isReverse ? this.startTile : this.destTile;

    const suctionGround = isReverse ? this.destPos.clone() : this.startPos.clone();
    const suctionPortalP = isReverse ? this.exitGroup.position.clone() : this.entranceGroup.position.clone();
    const emergePortalP = isReverse ? this.entranceGroup.position.clone() : this.exitGroup.position.clone();
    const targetGround = isReverse ? this.startPos.clone() : this.destPos.clone();

    const suctionGroup = isReverse ? this.exitGroup : this.entranceGroup;
    const emergeGroup = isReverse ? this.entranceGroup : this.exitGroup;

    // Audio & Comic Announcer
    if (this.audioManager?.playPortalEnter) {
      this.audioManager.playPortalEnter();
    }
    if (this.comicFX?.showBanner) {
      this.comicFX.showBanner(`🌀 DARK VOID RIFT: TILE ${originTile} ➔ TILE ${targetTile}!`);
    }

    const origScale = player.root.scale.clone();
    const startTime = performance.now();
    const phase1Duration = 420;
    const phase2Duration = 450;
    const phase3Duration = 420;

    if (player.animator) {
      player.animator.setState('jump');
    }

    // Phase 1: Player gets sucked in while entrance portal vanishes into singularity!
    const animateSuction = () => {
      const now = performance.now();
      const p = Math.min(1.0, (now - startTime) / phase1Duration);

      player.root.position.lerpVectors(suctionGround, suctionPortalP, p);
      player.root.rotation.y += 0.38;
      player.root.rotation.z += 0.28;

      const s = Math.max(0.01, 1.0 - p);
      player.root.scale.set(s * 0.3, s * 1.8, s * 0.3);

      // Entrance portal vanishes / collapses into a dark point
      const portalS = Math.max(0.05, 1.0 - p * 0.85);
      suctionGroup.scale.set(portalS, portalS, portalS);

      if (onCameraTrack) {
        onCameraTrack(suctionPortalP, emergePortalP, p * 0.3);
      }

      if (p < 1.0) {
        requestAnimationFrame(animateSuction);
      } else {
        player.root.visible = false;
        // Entrance snaps back open with dark aura
        suctionGroup.scale.set(1.0, 1.0, 1.0);
        startTransit();
      }
    };

    // Phase 2: Wormhole Camera Transit
    const startTransit = () => {
      const transitStart = performance.now();

      const animateTransit = () => {
        const now = performance.now();
        const p = Math.min(1.0, (now - transitStart) / phase2Duration);

        if (onCameraTrack) {
          onCameraTrack(suctionPortalP, emergePortalP, 0.3 + p * 0.4);
        }

        if (p < 1.0) {
          requestAnimationFrame(animateTransit);
        } else {
          startEmergence();
        }
      };

      requestAnimationFrame(animateTransit);
    };

    // Phase 3: Explosive Emergence as destination portal erupts and re-appears!
    const startEmergence = () => {
      player.root.position.copy(emergePortalP);
      player.root.visible = true;
      player.root.rotation.set(0, 0, 0);

      if (this.audioManager?.playPortalExit) {
        this.audioManager.playPortalExit();
      }

      const emergeStart = performance.now();

      const animateEmergence = () => {
        const now = performance.now();
        const p = Math.min(1.0, (now - emergeStart) / phase3Duration);

        // Destination portal flare and dark wave expansion
        const flare = 1.0 + Math.sin(p * Math.PI) * 0.45;
        emergeGroup.scale.set(flare, flare, flare);

        player.root.position.lerpVectors(emergePortalP, targetGround, p);

        const easeOutBack = (t) => {
          const c1 = 1.70158;
          const c3 = c1 + 1;
          return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        };
        const s = Math.min(1.0, easeOutBack(p));
        player.root.scale.set(origScale.x * s, origScale.y * s, origScale.z * s);

        if (onCameraTrack) {
          onCameraTrack(suctionPortalP, emergePortalP, 0.7 + p * 0.3);
        }

        if (p < 1.0) {
          requestAnimationFrame(animateEmergence);
        } else {
          player.root.position.copy(targetGround);
          player.root.scale.copy(origScale);
          player.root.rotation.set(0, 0, 0);
          emergeGroup.scale.set(1.0, 1.0, 1.0);

          if (player.animator) {
            player.animator.setState('idle');
          }

          player.currentTile = targetTile;

          if (onComplete) {
            onComplete(targetTile);
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
      this.entranceDisk.rotation.z += delta * 2.5;
    }
    if (this.exitDisk) {
      this.exitDisk.rotation.z -= delta * 2.5;
    }

    // Subtle dark levitation breathing
    const floatOffset = Math.sin(this.animTime * 2.4) * 0.09;
    this.entranceGroup.position.y = 1.2 + floatOffset;
    this.exitGroup.position.y = 1.2 + Math.cos(this.animTime * 2.4) * 0.09;

    // Dark matter orbiting sparks
    this.sparks.forEach(sp => {
      const positions = sp.geo.attributes.position.array;
      for (let i = 0; i < sp.count; i++) {
        sp.angles[i] += delta * sp.speeds[i];
        const a = sp.angles[i];
        const r = sp.radii[i] + Math.sin(this.animTime * 4 + i) * 0.05;

        positions[i * 3 + 0] = Math.cos(a) * r;
        positions[i * 3 + 1] = Math.sin(a) * r;
        positions[i * 3 + 2] = Math.sin(a * 2 + this.animTime) * 0.14;
      }
      sp.geo.attributes.position.needsUpdate = true;
    });
  }

  dispose() {
    this.scene.remove(this.entranceGroup);
    this.scene.remove(this.exitGroup);
  }
}
