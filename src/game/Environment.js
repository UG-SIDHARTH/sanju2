// ==========================================================================
// ENVIRONMENT - Masterpiece Cinematic Manhattan Penthouse Helipad Arena
// 3D Illuminated Manhattan Skyline, Iconic Stark / Oscorp / Bugle Towers,
// Animated Sweeping Searchlights, Aviation Hazard Beacons & Midnight Atmosphere
// ==========================================================================

import * as THREE from 'three';

export class Environment {
  constructor(scene, camera = null, domElement = null, audioManager = null) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.audioManager = audioManager;

    this.searchlights = [];
    this.beacons = [];
    this.trees = [];
    this.bushes = [];
    this.waterRipples = [];
    this.fallingLeaves = [];
    this.shootingStars = [];
    this.interactiveObjects = [];

    this.animTime = 0;
    this.mouse = new THREE.Vector2(0, 0);
    this.mouseTargetWorld = new THREE.Vector3(0, 35, -45);
    this.isMouseActive = false;
    this.raycaster = new THREE.Raycaster();

    this.createLights();
    this.createRooftopSkyGarden();
    this.create3DSkyscraperSkyline();
    this.createSearchlights();
    this.createSkyDome();
    this.createFireflies();

    if (this.camera && this.domElement) {
      this.setupInteractivity();
    }
  }

  createLights() {
    // 1. Ambient Light - soft cool midnight fill with natural moonlight
    const ambientLight = new THREE.AmbientLight(0x384252, 1.6);
    this.scene.add(ambientLight);

    // 2. Main Key Light - cool silvery moonlight angled from upper Manhattan
    const moonKeyLight = new THREE.DirectionalLight(0xdbeafe, 2.0);
    moonKeyLight.position.set(25, 50, 30);
    moonKeyLight.castShadow = true;
    moonKeyLight.shadow.mapSize.width = 2048;
    moonKeyLight.shadow.mapSize.height = 2048;
    moonKeyLight.shadow.camera.near = 1.0;
    moonKeyLight.shadow.camera.far = 130;
    moonKeyLight.shadow.camera.left = -22;
    moonKeyLight.shadow.camera.right = 22;
    moonKeyLight.shadow.camera.top = 22;
    moonKeyLight.shadow.camera.bottom = -22;
    moonKeyLight.shadow.bias = -0.0004;
    this.scene.add(moonKeyLight);

    // 3. City Underglow Fill Light - warm amber/gold upward bounce from Manhattan streets
    const streetGlowLight = new THREE.DirectionalLight(0xf59e0b, 0.65);
    streetGlowLight.position.set(-25, -15, -20);
    this.scene.add(streetGlowLight);

    // 4. Cyan Rim Light - futuristic Stark aesthetic edge highlight
    const cyanRimLight = new THREE.DirectionalLight(0x06b6d4, 0.75);
    cyanRimLight.position.set(-35, 25, -35);
    this.scene.add(cyanRimLight);
  }

  createRooftopSkyGarden() {
    this.rooftopGroup = new THREE.Group();
    this.rooftopGroup.position.y = 0;
    this.scene.add(this.rooftopGroup);

    // --- 1. Architectural Slate & Granite Paving Texture ---
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Natural dark slate flagstone paving
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1024, 1024);

    // Slate stone tile seams
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 3;
    for (let i = 0; i <= 1024; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 1024);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(1024, i);
      ctx.stroke();
    }

    // Granite decorative courtyard border
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 8;
    ctx.strokeRect(120, 120, 784, 784);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 4;
    ctx.strokeRect(140, 140, 744, 744);

    const deckTex = new THREE.CanvasTexture(canvas);
    deckTex.anisotropy = 8;

    // Main Rooftop Sky-Garden Terrace Deck
    const deckGeo = new THREE.BoxGeometry(44, 1.8, 44);
    const deckMat = new THREE.MeshStandardMaterial({
      map: deckTex,
      roughness: 0.52,
      metalness: 0.25
    });
    const deckMesh = new THREE.Mesh(deckGeo, deckMat);
    deckMesh.position.y = -0.9;
    deckMesh.receiveShadow = true;
    this.rooftopGroup.add(deckMesh);

    // Glowing Cyan Perimeter Trim
    const trimGeo = new THREE.BoxGeometry(44.6, 0.25, 44.6);
    const trimMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = 0.02;
    this.rooftopGroup.add(trimMesh);

    // --- 2. Living Green Grass Lawn Apron Surrounding Board ---
    const grassCanvas = document.createElement('canvas');
    grassCanvas.width = 512;
    grassCanvas.height = 512;
    const gCtx = grassCanvas.getContext('2d');

    // Rich organic lawn green
    gCtx.fillStyle = '#14532d';
    gCtx.fillRect(0, 0, 512, 512);

    // Micro grass blades
    gCtx.fillStyle = '#16a34a';
    for (let i = 0; i < 1800; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      gCtx.fillRect(rx, ry, Math.random() * 2 + 1, Math.random() * 5 + 2);
    }
    // Subtle earthy soil specks
    gCtx.fillStyle = '#15803d';
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      gCtx.fillRect(rx, ry, 3, 3);
    }

    const grassTex = new THREE.CanvasTexture(grassCanvas);
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(3, 3);

    const grassMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.85,
      metalness: 0.05
    });

    // 4 Lawn strips framing the board platform
    const lawnConfigs = [
      { w: 42, d: 5.5, x: 0, z: -18.2 }, // North lawn
      { w: 42, d: 5.5, x: 0, z: 18.2 },  // South lawn
      { w: 5.5, d: 31, x: 18.2, z: 0 },   // East lawn
      { w: 5.5, d: 31, x: -18.2, z: 0 }   // West lawn
    ];

    lawnConfigs.forEach(lc => {
      const lawn = new THREE.Mesh(new THREE.BoxGeometry(lc.w, 0.12, lc.d), grassMat);
      lawn.position.set(lc.x, 0.06, lc.z);
      lawn.receiveShadow = true;
      this.rooftopGroup.add(lawn);
    });

    // --- 3. Sculpted Planters & Swaying Japanese Maple Trees ---
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x3e2723,
      roughness: 0.85,
      metalness: 0.05
    });

    const planterMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.65,
      metalness: 0.2
    });

    const leafCrimsonMat = new THREE.MeshStandardMaterial({
      color: 0xbe123c, // Autumn crimson maple leaves
      roughness: 0.65,
      metalness: 0.08
    });

    const leafGreenMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Lush emerald leaves
      roughness: 0.70,
      metalness: 0.05
    });

    const treeCorners = [
      { x: -16, z: -16, isCrimson: true },
      { x: 16, z: -16, isCrimson: false },
      { x: 16, z: 16, isCrimson: true },
      { x: -16, z: 16, isCrimson: false }
    ];

    treeCorners.forEach((tc, idx) => {
      // Stone planter bed
      const planter = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.7, 12), planterMat);
      planter.position.set(tc.x, 0.35, tc.z);
      planter.receiveShadow = true;
      this.rooftopGroup.add(planter);

      // Soil inside planter
      const soil = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.1, 12), woodMat);
      soil.position.set(tc.x, 0.71, tc.z);
      this.rooftopGroup.add(soil);

      // Tree Group with dynamic wind sway
      const treeGroup = new THREE.Group();
      treeGroup.position.set(tc.x, 0.7, tc.z);
      this.rooftopGroup.add(treeGroup);

      // Organic curved trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.30, 4.2, 8), woodMat);
      trunk.position.y = 2.1;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Canopy with clustered foliage spheres
      const canopyGroup = new THREE.Group();
      canopyGroup.position.y = 3.8;
      treeGroup.add(canopyGroup);

      const leafMat = tc.isCrimson ? leafCrimsonMat : leafGreenMat;
      const foliageClusters = [
        { x: 0, y: 0.6, z: 0, r: 1.8 },
        { x: -0.9, y: 0.2, z: 0.5, r: 1.3 },
        { x: 0.8, y: 0.3, z: -0.6, r: 1.4 },
        { x: 0.5, y: -0.2, z: 0.8, r: 1.2 },
        { x: -0.6, y: -0.1, z: -0.7, r: 1.2 }
      ];

      foliageClusters.forEach(fc => {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(fc.r, 8, 8), leafMat);
        sphere.position.set(fc.x, fc.y, fc.z);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        canopyGroup.add(sphere);

        // Register interactive canopy for clicks & leaf rustle
        this.interactiveObjects.push({
          mesh: sphere,
          type: 'tree',
          treeIndex: idx,
          treeGroup
        });
      });

      this.trees.push({
        group: treeGroup,
        canopy: canopyGroup,
        trunk,
        basePos: new THREE.Vector3(tc.x, 0.7, tc.z),
        phase: idx * 1.5,
        rustleIntensity: 0
      });
    });

    // --- 4. Flowering Hydrangea & Boxwood Shrub Clusters ---
    const bushPositions = [
      { x: -8, z: -18.2, color: 0xd946ef },
      { x: 8, z: -18.2, color: 0x38bdf8 },
      { x: -8, z: 18.2, color: 0x38bdf8 },
      { x: 8, z: 18.2, color: 0xd946ef },
      { x: 18.2, z: -6, color: 0x10b981 },
      { x: 18.2, z: 6, color: 0x10b981 }
    ];

    bushPositions.forEach((bp, bIdx) => {
      const bushGroup = new THREE.Group();
      bushGroup.position.set(bp.x, 0.2, bp.z);
      this.rooftopGroup.add(bushGroup);

      const bushMesh = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), leafGreenMat);
      bushMesh.scale.set(1.4, 0.85, 1.2);
      bushMesh.position.y = 0.6;
      bushMesh.castShadow = true;
      bushMesh.receiveShadow = true;
      bushGroup.add(bushMesh);

      // Blossom accent
      const flowerMat = new THREE.MeshStandardMaterial({
        color: bp.color,
        emissive: bp.color,
        emissiveIntensity: 0.35,
        roughness: 0.5
      });
      for (let f = 0; f < 6; f++) {
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), flowerMat);
        const a = (f / 6) * Math.PI * 2;
        flower.position.set(Math.cos(a) * 0.9, 0.9 + (f % 2) * 0.2, Math.sin(a) * 0.7);
        bushGroup.add(flower);
      }

      this.interactiveObjects.push({
        mesh: bushMesh,
        type: 'bush',
        bushIndex: bIdx,
        bushGroup
      });

      this.bushes.push({
        group: bushGroup,
        basePos: bushGroup.position.clone(),
        phase: bIdx * 1.2,
        rustleIntensity: 0
      });
    });

    // --- 5. Reflective Moonlit Water Lily Pond ---
    const pondGroup = new THREE.Group();
    pondGroup.position.set(-18.2, 0.15, 0);
    this.rooftopGroup.add(pondGroup);

    // Stone border rim
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.75,
      metalness: 0.1
    });
    const pondRim = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.28, 14), rimMat);
    pondRim.position.y = 0.08;
    pondRim.receiveShadow = true;
    pondGroup.add(pondRim);

    // Reflective Water Surface
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.04,
      metalness: 0.94,
      transparent: true,
      opacity: 0.88
    });
    this.waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 13.2), waterMat);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.y = 0.16;
    this.waterMesh.receiveShadow = true;
    pondGroup.add(this.waterMesh);

    // Register water pool as primary interactive object
    this.interactiveObjects.push({
      mesh: this.waterMesh,
      type: 'water',
      worldPos: pondGroup.position
    });

    // Floating Water Lily Pads & Night Flowers
    const lilyPadMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.55
    });
    const flowerWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.4,
      roughness: 0.3
    });

    [-4.5, -1.5, 1.8, 4.5].forEach((lz, idx) => {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.03, 14), lilyPadMat);
      pad.position.set((idx % 2 === 0 ? -0.5 : 0.5), 0.18, lz);
      pondGroup.add(pad);

      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), flowerWhiteMat);
      flower.position.set((idx % 2 === 0 ? -0.5 : 0.5), 0.28, lz);
      pondGroup.add(flower);
    });

    // --- 6. Warm Stone Garden Lantern Pagodas ---
    const lanternPositions = [
      { x: -14, z: -11 },
      { x: -14, z: 11 },
      { x: 14, z: -11 },
      { x: 14, z: 11 }
    ];

    lanternPositions.forEach(lp => {
      const lanternGroup = new THREE.Group();
      lanternGroup.position.set(lp.x, 0.08, lp.z);
      this.rooftopGroup.add(lanternGroup);

      // Stone base & pillar
      const lBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), planterMat);
      lBase.position.y = 0.3;
      lanternGroup.add(lBase);

      const lPost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.8, 8), planterMat);
      lPost.position.y = 0.8;
      lanternGroup.add(lPost);

      // Glowing amber light chamber
      const lCore = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.55, 0.55),
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xf59e0b,
          emissiveIntensity: 1.5,
          roughness: 0.2
        })
      );
      lCore.position.y = 1.35;
      lanternGroup.add(lCore);

      // Pagoda roof cap
      const lRoof = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.45, 4), planterMat);
      lRoof.position.y = 1.8;
      lRoof.rotation.y = Math.PI / 4;
      lanternGroup.add(lRoof);
    });

    // --- 7. Tempered Glass Safety Railings ---
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.32,
      roughness: 0.1,
      metalness: 0.9
    });
    const postMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.2,
      metalness: 0.8
    });
    const neonCapMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const createRailingSide = (x, z, length, isZAligned) => {
      const panelGeo = isZAligned
        ? new THREE.BoxGeometry(0.08, 1.4, length)
        : new THREE.BoxGeometry(length, 1.4, 0.08);
      const panel = new THREE.Mesh(panelGeo, railMat);
      panel.position.set(x, 0.7, z);
      this.rooftopGroup.add(panel);

      const numPosts = 6;
      for (let i = 0; i <= numPosts; i++) {
        const offset = (i / numPosts - 0.5) * length;
        const px = isZAligned ? x : x + offset;
        const pz = isZAligned ? z + offset : z;

        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 8), postMat);
        post.position.set(px, 0.75, pz);
        this.rooftopGroup.add(post);

        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), neonCapMat);
        cap.position.set(px, 1.52, pz);
        this.rooftopGroup.add(cap);
      }
    };

    createRailingSide(0, 22.1, 44, false);
    createRailingSide(0, -22.1, 44, false);
    createRailingSide(22.1, 0, 44, true);
    createRailingSide(-22.1, 0, 44, true);

    // Corner beacon masts
    [-19, 19].forEach(cx => {
      [-19, 19].forEach(cz => {
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 4.2, 8), postMat);
        mast.position.set(cx, 3.7, cz);
        this.rooftopGroup.add(mast);

        const beacon = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xef4444 })
        );
        beacon.position.set(cx, 5.8, cz);
        this.rooftopGroup.add(beacon);
        this.beacons.push(beacon);
      });
    });
  }

  create3DSkyscraperSkyline() {
    this.skylineGroup = new THREE.Group();
    this.scene.add(this.skylineGroup);

    // Procedural Window Grid Canvas Texture
    const winCanvas = document.createElement('canvas');
    winCanvas.width = 512;
    winCanvas.height = 512;
    const wCtx = winCanvas.getContext('2d');

    wCtx.fillStyle = '#090d16'; // Deep midnight building facade
    wCtx.fillRect(0, 0, 512, 512);

    // Draw realistic randomized office windows
    const cols = 16;
    const rows = 32;
    const padX = 512 / cols;
    const padY = 512 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rand = (Math.sin(r * 43.1 + c * 17.7) + 1) * 0.5;
        if (rand > 0.42) {
          // Lit window: warm amber, golden, or cool office cyan
          if (rand > 0.82) wCtx.fillStyle = '#fef08a'; // Golden amber
          else if (rand > 0.62) wCtx.fillStyle = '#bae6fd'; // Cool fluorescent cyan
          else wCtx.fillStyle = '#fed7aa'; // Warm office light
          wCtx.fillRect(c * padX + 4, r * padY + 3, padX - 8, padY - 6);
        } else {
          // Unlit window (dark glass reflect)
          wCtx.fillStyle = '#0f172a';
          wCtx.fillRect(c * padX + 4, r * padY + 3, padX - 8, padY - 6);
        }
      }
    }

    const windowTex = new THREE.CanvasTexture(winCanvas);
    windowTex.wrapS = THREE.RepeatWrapping;
    windowTex.wrapT = THREE.RepeatWrapping;

    const bldgMat = new THREE.MeshStandardMaterial({
      map: windowTex,
      roughness: 0.3,
      metalness: 0.7
    });

    const darkBldgMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.25,
      metalness: 0.85
    });

    // 20 Surrounding 3D Skyscraper Towers
    const towerConfigs = [
      // North Skyline (Behind Goal / Dr. Octopus zone)
      { x: -35, z: -55, w: 16, d: 16, h: 75, name: 'STARK' },
      { x: -10, z: -65, w: 18, d: 18, h: 90, name: 'EMPIRE' },
      { x: 15, z: -60, w: 14, d: 14, h: 78, name: 'OSCORP' },
      { x: 38, z: -52, w: 15, d: 15, h: 68 },
      { x: -55, z: -45, w: 16, d: 16, h: 62 },

      // East Skyline
      { x: 55, z: -30, w: 14, d: 14, h: 72 },
      { x: 62, z: -5, w: 18, d: 16, h: 84, name: 'BUGLE' },
      { x: 56, z: 20, w: 15, d: 15, h: 65 },
      { x: 52, z: 45, w: 16, d: 16, h: 58 },

      // South Skyline (Camera front)
      { x: 32, z: 58, w: 15, d: 15, h: 52 },
      { x: 5, z: 64, w: 18, d: 18, h: 48 },
      { x: -22, z: 60, w: 14, d: 14, h: 54 },
      { x: -46, z: 52, w: 16, d: 16, h: 46 },

      // West Skyline
      { x: -58, z: 30, w: 15, d: 15, h: 66 },
      { x: -64, z: 5, w: 18, d: 18, h: 82, name: 'BAXTER' },
      { x: -58, z: -20, w: 15, d: 15, h: 70 },

      // Outer Distance Silhouette Towers
      { x: -75, z: -70, w: 22, d: 22, h: 105 },
      { x: 80, z: -75, w: 24, d: 24, h: 110 },
      { x: 78, z: 65, w: 20, d: 20, h: 95 },
      { x: -80, z: 68, w: 22, d: 22, h: 100 }
    ];

    towerConfigs.forEach(cfg => {
      const towerGroup = new THREE.Group();
      towerGroup.position.set(cfg.x, -cfg.h / 2 + 15, cfg.z);
      this.skylineGroup.add(towerGroup);

      // Main tower body
      const towerGeo = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d);
      const mesh = new THREE.Mesh(towerGeo, bldgMat);
      towerGroup.add(mesh);

      // Upper tier setback
      const setbackH = cfg.h * 0.35;
      const setbackGeo = new THREE.BoxGeometry(cfg.w * 0.72, setbackH, cfg.d * 0.72);
      const setback = new THREE.Mesh(setbackGeo, bldgMat);
      setback.position.y = cfg.h / 2 + setbackH / 2;
      towerGroup.add(setback);

      // Spire / Crown
      const spireH = 12 + Math.random() * 10;
      const spireGeo = new THREE.CylinderGeometry(0.15, 0.9, spireH, 8);
      const spire = new THREE.Mesh(spireGeo, darkBldgMat);
      spire.position.y = cfg.h / 2 + setbackH + spireH / 2;
      towerGroup.add(spire);

      // Red blinking beacon at tip of skyscraper
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), beaconMat);
      beacon.position.y = cfg.h / 2 + setbackH + spireH;
      towerGroup.add(beacon);
      this.beacons.push(beacon);

      // Landmark Rooftop Signs
      if (cfg.name === 'STARK') {
        this.createStarkTowerFeatures(towerGroup, cfg.h / 2 + setbackH);
      } else if (cfg.name === 'OSCORP') {
        this.createOscorpTowerFeatures(towerGroup, cfg.h / 2 + setbackH);
      } else if (cfg.name === 'BUGLE') {
        this.createDailyBugleFeatures(towerGroup, cfg.h / 2 + setbackH);
      }
    });
  }

  createStarkTowerFeatures(parentGroup, topY) {
    // Iconic STARK Cantilevered Landing Arch & Glowing Neon Sign
    const archGeo = new THREE.CylinderGeometry(5.2, 5.2, 1.2, 24, 1, false, 0, Math.PI);
    const neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const arch = new THREE.Mesh(archGeo, neonCyanMat);
    arch.rotation.z = Math.PI / 2;
    arch.rotation.y = Math.PI / 4;
    arch.position.set(0, topY + 4, 0);
    parentGroup.add(arch);

    // Glowing STARK Billboard Canvas
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sCtx = signCanvas.getContext('2d');
    sCtx.fillStyle = '#090d16';
    sCtx.fillRect(0, 0, 512, 128);
    sCtx.font = '900 68px "Outfit", sans-serif';
    sCtx.fillStyle = '#38bdf8';
    sCtx.textAlign = 'center';
    sCtx.fillText('STARK', 256, 88);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signGeo = new THREE.PlaneGeometry(10, 2.5);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, topY + 8, 3.5);
    parentGroup.add(sign);
  }

  createOscorpTowerFeatures(parentGroup, topY) {
    // OSCORP Glowing Emerald Spire & Logo Billboard
    const spireGlowGeo = new THREE.ConeGeometry(2.5, 14, 8);
    const emeraldMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const spireGlow = new THREE.Mesh(spireGlowGeo, emeraldMat);
    spireGlow.position.set(0, topY + 7, 0);
    parentGroup.add(spireGlow);

    // OSCORP Neon Billboard
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sCtx = signCanvas.getContext('2d');
    sCtx.fillStyle = '#090d16';
    sCtx.fillRect(0, 0, 512, 128);
    sCtx.font = '900 64px "Outfit", sans-serif';
    sCtx.fillStyle = '#10b981';
    sCtx.textAlign = 'center';
    sCtx.fillText('OSCORP', 256, 88);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signGeo = new THREE.PlaneGeometry(11, 2.8);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, topY + 6, -3.5);
    sign.rotation.y = Math.PI;
    parentGroup.add(sign);
  }

  createDailyBugleFeatures(parentGroup, topY) {
    // DAILY BUGLE Giant Rooftop Neon Billboard
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 160;
    const sCtx = signCanvas.getContext('2d');
    sCtx.fillStyle = '#090d16';
    sCtx.fillRect(0, 0, 512, 160);
    sCtx.strokeStyle = '#ef4444';
    sCtx.lineWidth = 6;
    sCtx.strokeRect(8, 8, 496, 144);
    sCtx.font = '900 52px "Bangers", Impact, sans-serif';
    sCtx.fillStyle = '#ef4444';
    sCtx.textAlign = 'center';
    sCtx.fillText('DAILY BUGLE', 256, 96);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signGeo = new THREE.PlaneGeometry(12, 3.8);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(-3.5, topY + 7, 0);
    sign.rotation.y = -Math.PI / 2;
    parentGroup.add(sign);

    // Classic NYC Wooden Water Tower
    const waterTank = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.2, 3.8, 12),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 })
    );
    waterTank.position.set(2.5, topY + 4.5, 0);
    parentGroup.add(waterTank);

    const tankRoof = new THREE.Mesh(
      new THREE.ConeGeometry(2.5, 1.8, 12),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 })
    );
    tankRoof.position.set(2.5, topY + 7.2, 0);
    parentGroup.add(tankRoof);
  }

  createSearchlights() {
    // 4 Cinematic Rooftop Searchlights sweeping the midnight Manhattan skies
    const searchlightPositions = [
      { x: -35, y: 38, z: -55, color: 0x38bdf8, baseAngle: 0 },
      { x: 62, y: 44, z: -5, color: 0xfef08a, baseAngle: Math.PI / 2 },
      { x: -64, y: 42, z: 5, color: 0x10b981, baseAngle: Math.PI },
      { x: 15, y: 40, z: -60, color: 0x38bdf8, baseAngle: Math.PI * 1.5 }
    ];

    searchlightPositions.forEach((pos, idx) => {
      const group = new THREE.Group();
      group.position.set(pos.x, pos.y, pos.z);
      this.scene.add(group);

      // Projector base housing
      const housing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 1.0, 1.5, 12),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
      );
      housing.rotation.x = Math.PI / 2;
      group.add(housing);

      // Volumetric light beam cone
      const coneGeo = new THREE.ConeGeometry(8, 75, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: pos.color,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const beam = new THREE.Mesh(coneGeo, coneMat);
      beam.position.y = 37.5;
      group.add(beam);

      this.searchlights.push({
        group,
        pos: new THREE.Vector3(pos.x, pos.y, pos.z),
        baseAngle: pos.baseAngle,
        speed: 0.6 + idx * 0.15
      });
    });
  }

  createSkyDome() {
    // Deep midnight Manhattan starry sky dome
    const skyGeo = new THREE.SphereGeometry(180, 24, 16);
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Midnight atmospheric gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#020617'); // Pitch zenith
    grad.addColorStop(0.5, '#090d16'); // Midnight navy
    grad.addColorStop(0.85, '#0f172a'); // City haze
    grad.addColorStop(1.0, '#1e293b'); // Warm horizon glow
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Starfield
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 240; i++) {
      const x = (i * 73) % 1024;
      const y = (i * 37) % 360;
      const r = (i % 3 === 0) ? 1.8 : 1.0;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const skyTex = new THREE.CanvasTexture(canvas);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);
  }

  createFireflies() {
    const count = 120;
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = 0.5 + Math.random() * 4.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.6 + Math.random() * 0.8;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(254, 240, 138, 1)');
    grad.addColorStop(0.35, 'rgba(234, 179, 8, 0.7)');
    grad.addColorStop(0.8, 'rgba(163, 230, 53, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const glowTex = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      map: glowTex,
      size: 0.7,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.fireflyPoints = new THREE.Points(geo, mat);
    this.scene.add(this.fireflyPoints);
    this.fireflyData = { positions, phases, speeds, count };
  }

  setupInteractivity() {
    if (!this.domElement || !this.camera) return;

    this.onPointerMove = (e) => {
      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.isMouseActive = true;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const hit = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(groundPlane, hit)) {
        this.mouseTargetWorld.copy(hit);
      }
    };

    this.onPointerDown = (e) => {
      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      // 1. Raycast against registered interactive objects
      const candidateMeshes = this.interactiveObjects.map(io => io.mesh);
      const intersects = this.raycaster.intersectObjects(candidateMeshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const io = this.interactiveObjects.find(obj => obj.mesh === hit.object);
        if (io) {
          if (io.type === 'water') {
            this.spawnWaterRipple(hit.point.x, hit.point.z);
            if (this.audioManager?.playWaterDrop) this.audioManager.playWaterDrop();
            return;
          } else if (io.type === 'tree') {
            this.rustleTree(io.treeIndex, hit.point);
            return;
          } else if (io.type === 'bush') {
            this.rustleBush(io.bushIndex, hit.point);
            return;
          }
        }
      }

      // 2. Raycast to arena ground
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const groundHit = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(groundPlane, groundHit)) {
        if (groundHit.x <= -15.5 && groundHit.x >= -20.8 && Math.abs(groundHit.z) <= 7.2) {
          this.spawnWaterRipple(groundHit.x, groundHit.z);
          if (this.audioManager?.playWaterDrop) this.audioManager.playWaterDrop();
        } else if (Math.abs(groundHit.x) > 22 || Math.abs(groundHit.z) > 22) {
          this.triggerRandomShootingStar();
        }
      } else {
        this.triggerRandomShootingStar();
      }
    };

    this.domElement.addEventListener('pointermove', this.onPointerMove);
    this.domElement.addEventListener('pointerdown', this.onPointerDown);
  }

  spawnWaterRipple(x, z) {
    [0, 0.15].forEach((delay, ringIdx) => {
      setTimeout(() => {
        const ringGeo = new THREE.RingGeometry(0.12, 0.22, 28);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x7dd3fc,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.set(x, 0.18, z);
        this.rooftopGroup.add(ringMesh);

        this.waterRipples.push({
          mesh: ringMesh,
          life: 0,
          maxLife: 1.6,
          scaleMax: 3.8 + ringIdx * 0.8
        });
      }, delay * 1000);
    });
  }

  rustleTree(treeIndex, worldPos) {
    if (this.trees[treeIndex]) {
      this.trees[treeIndex].rustleIntensity = 1.6;
    }
    if (this.audioManager?.playRustle) {
      this.audioManager.playRustle();
    }
    const isCrimson = this.trees[treeIndex] ? (treeIndex % 2 === 0) : true;
    this.spawnFallingLeaves(worldPos || (this.trees[treeIndex]?.basePos), isCrimson, 10);
  }

  rustleBush(bushIndex, worldPos) {
    if (this.bushes[bushIndex]) {
      this.bushes[bushIndex].rustleIntensity = 1.4;
    }
    if (this.audioManager?.playRustle) {
      this.audioManager.playRustle();
    }
    this.spawnFallingLeaves(worldPos || (this.bushes[bushIndex]?.basePos), false, 6);
  }

  spawnFallingLeaves(origin, isCrimson = true, count = 8) {
    if (!origin) return;

    const leafMat = new THREE.MeshStandardMaterial({
      color: isCrimson ? 0xbe123c : 0x16a34a,
      roughness: 0.65,
      side: THREE.DoubleSide
    });
    const leafGeo = new THREE.PlaneGeometry(0.18, 0.14);

    for (let i = 0; i < count; i++) {
      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      leafMesh.position.set(
        origin.x + (Math.random() - 0.5) * 1.5,
        Math.max(1.2, origin.y + (Math.random() - 0.2) * 1.0),
        origin.z + (Math.random() - 0.5) * 1.5
      );
      leafMesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      this.rooftopGroup.add(leafMesh);

      this.fallingLeaves.push({
        mesh: leafMesh,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 1.8,
          0.8 + Math.random() * 1.2,
          (Math.random() - 0.5) * 1.8
        ),
        rotVel: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        ),
        life: 0,
        maxLife: 3.5,
        landed: false
      });
    }
  }

  triggerRandomShootingStar() {
    const startX = (Math.random() - 0.5) * 100;
    const startY = 65 + Math.random() * 25;
    const startZ = -70 + (Math.random() - 0.5) * 40;

    const dirX = (Math.random() - 0.5) * 50;
    const dirY = -30 - Math.random() * 20;
    const dirZ = (Math.random() - 0.5) * 40;

    this.createShootingStar(
      startX, startY, startZ,
      startX + dirX, startY + dirY, startZ + dirZ
    );
  }

  createShootingStar(startX, startY, startZ, targetX, targetY, targetZ) {
    const p1 = new THREE.Vector3(startX, startY, startZ);
    const p2 = new THREE.Vector3(targetX, targetY, targetZ);

    const starGeo = new THREE.CylinderGeometry(0.08, 0.45, 12, 6);
    const starMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.95
    });

    const starMesh = new THREE.Mesh(starGeo, starMat);
    starMesh.position.copy(p1);
    starMesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      p2.clone().sub(p1).normalize()
    );
    this.scene.add(starMesh);

    this.shootingStars.push({
      mesh: starMesh,
      start: p1,
      target: p2,
      progress: 0,
      speed: 1.8
    });
  }

  update(delta) {
    this.animTime += delta;

    // 1. Interactive & Atmospheric Searchlights
    this.searchlights.forEach((sl, idx) => {
      if (this.isMouseActive && (idx === 0 || idx === 3)) {
        const dx = this.mouseTargetWorld.x - sl.pos.x;
        const dy = 0.5 - sl.pos.y;
        const dz = this.mouseTargetWorld.z - sl.pos.z;
        const targetYaw = Math.atan2(dx, dz);
        const distHoriz = Math.hypot(dx, dz);
        const targetPitch = Math.atan2(distHoriz, -dy);

        sl.group.rotation.y = THREE.MathUtils.lerp(sl.group.rotation.y, targetYaw, delta * 3.5);
        sl.group.rotation.x = THREE.MathUtils.lerp(sl.group.rotation.x, targetPitch, delta * 3.5);
      } else {
        const sweep = Math.sin(this.animTime * sl.speed + sl.baseAngle) * 0.45;
        const tilt = 0.5 + Math.cos(this.animTime * (sl.speed * 0.8) + idx) * 0.25;

        sl.group.rotation.y = sl.baseAngle + sweep;
        sl.group.rotation.x = tilt;
        sl.group.rotation.z = Math.sin(this.animTime * sl.speed * 0.5) * 0.15;
      }
    });

    // 2. Pulse red aviation hazard beacons atop skyscrapers and masts
    const flash = Math.sin(this.animTime * 4.0) > 0.2 ? 1.0 : 0.15;
    this.beacons.forEach(b => {
      b.material.color.setHex(flash > 0.5 ? 0xff2222 : 0x440000);
    });

    // 3. Living Japanese Maple Trees Wind Sway + Rustle Decay
    this.trees.forEach(t => {
      const breeze = Math.sin(this.animTime * 1.5 + t.phase) * 0.04;
      const shake = t.rustleIntensity > 0.01 ? Math.sin(this.animTime * 32) * t.rustleIntensity * 0.08 : 0;
      t.canopy.rotation.z = breeze + shake;
      t.canopy.rotation.x = (Math.cos(this.animTime * 1.2 + t.phase) * 0.03) + shake * 0.5;

      if (t.rustleIntensity > 0) {
        t.rustleIntensity = Math.max(0, t.rustleIntensity - delta * 1.8);
      }
    });

    // 4. Flowering Bushes Wind Sway + Rustle
    this.bushes.forEach(b => {
      const breeze = Math.sin(this.animTime * 2.0 + b.phase) * 0.03;
      const shake = b.rustleIntensity > 0.01 ? Math.sin(this.animTime * 28) * b.rustleIntensity * 0.07 : 0;
      b.group.rotation.z = breeze + shake;
      b.group.scale.y = 1.0 + Math.sin(this.animTime * 1.8 + b.phase) * 0.02;

      if (b.rustleIntensity > 0) {
        b.rustleIntensity = Math.max(0, b.rustleIntensity - delta * 1.8);
      }
    });

    // 5. Fireflies Floating & Drifting with Brownian Motion
    if (this.fireflyPoints && this.fireflyData) {
      const { positions, phases, speeds, count } = this.fireflyData;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        phases[i] += delta * speeds[i];
        positions[i3 + 1] += Math.sin(phases[i]) * 0.015;
        positions[i3 + 0] += Math.cos(phases[i] * 0.7) * 0.012;
        positions[i3 + 2] += Math.sin(phases[i] * 0.5) * 0.012;

        if (positions[i3 + 1] < 0.4) positions[i3 + 1] = 0.5;
        if (positions[i3 + 1] > 6.0) positions[i3 + 1] = 5.8;
        if (Math.abs(positions[i3 + 0]) > 21) positions[i3 + 0] *= 0.98;
        if (Math.abs(positions[i3 + 2]) > 21) positions[i3 + 2] *= 0.98;
      }
      this.fireflyPoints.geometry.attributes.position.needsUpdate = true;
    }

    // 6. Interactive Water Ripples Animation & Expiry
    for (let i = this.waterRipples.length - 1; i >= 0; i--) {
      const r = this.waterRipples[i];
      r.life += delta;
      const progress = r.life / r.maxLife;
      if (progress >= 1.0) {
        this.rooftopGroup.remove(r.mesh);
        r.mesh.geometry.dispose();
        r.mesh.material.dispose();
        this.waterRipples.splice(i, 1);
      } else {
        const s = THREE.MathUtils.lerp(0.5, r.scaleMax, Math.sqrt(progress));
        r.mesh.scale.set(s, s, s);
        r.mesh.material.opacity = Math.max(0, 0.85 * (1 - progress));
      }
    }

    // 7. Falling Leaves Physics & Decay
    for (let i = this.fallingLeaves.length - 1; i >= 0; i--) {
      const leaf = this.fallingLeaves[i];
      leaf.life += delta;
      if (leaf.life >= leaf.maxLife) {
        this.rooftopGroup.remove(leaf.mesh);
        leaf.mesh.geometry.dispose();
        leaf.mesh.material.dispose();
        this.fallingLeaves.splice(i, 1);
      } else {
        if (!leaf.landed) {
          leaf.vel.y -= 3.5 * delta;
          leaf.mesh.position.addScaledVector(leaf.vel, delta);
          leaf.mesh.position.x += Math.sin(leaf.life * 6) * 0.03;
          leaf.mesh.rotation.x += leaf.rotVel.x * delta;
          leaf.mesh.rotation.y += leaf.rotVel.y * delta;
          leaf.mesh.rotation.z += leaf.rotVel.z * delta;

          if (leaf.mesh.position.y <= 0.08) {
            leaf.mesh.position.y = 0.08;
            leaf.landed = true;
            leaf.mesh.rotation.x = -Math.PI / 2;
          }
        } else {
          const fadeProgress = (leaf.life - (leaf.maxLife - 1.2)) / 1.2;
          if (fadeProgress > 0) {
            leaf.mesh.material.transparent = true;
            leaf.mesh.material.opacity = Math.max(0, 1 - fadeProgress);
          }
        }
      }
    }

    // 8. Shooting Stars Streak & Fade
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const star = this.shootingStars[i];
      star.progress += delta * star.speed;
      if (star.progress >= 1.0) {
        this.scene.remove(star.mesh);
        star.mesh.geometry.dispose();
        star.mesh.material.dispose();
        this.shootingStars.splice(i, 1);
      } else {
        star.mesh.position.lerpVectors(star.start, star.target, star.progress);
        star.mesh.material.opacity = Math.max(0, 0.95 * (1 - star.progress));
      }
    }
  }
}

