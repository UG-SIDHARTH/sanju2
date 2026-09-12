// ==========================================================================
// ENVIRONMENT - Masterpiece Cinematic Manhattan Penthouse Arena
// Highly Optimized for Low-End Systems (Intel Pentium, 4GB DDR3, Intel iGPU)
// Fast 60 FPS, No Realtime Shadow Passes, No Trees, Crisp Minimalist Aesthetic
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
    this.waterRipples = [];
    this.interactiveObjects = [];

    this.animTime = 0;
    this.mouse = new THREE.Vector2(0, 0);
    this.raycaster = new THREE.Raycaster();

    this.createLights();
    this.createRooftopArena();
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
    const ambientLight = new THREE.AmbientLight(0x475569, 1.7);
    this.scene.add(ambientLight);

    // 2. Main Key Light - cool silvery moonlight angled from upper Manhattan (No dynamic shadows for max FPS)
    const moonKeyLight = new THREE.DirectionalLight(0xdbeafe, 1.8);
    moonKeyLight.position.set(25, 50, 30);
    this.scene.add(moonKeyLight);

    // 3. City Underglow Fill Light - warm amber/gold upward bounce from Manhattan streets
    const streetGlowLight = new THREE.DirectionalLight(0xf59e0b, 0.6);
    streetGlowLight.position.set(-25, -15, -20);
    this.scene.add(streetGlowLight);

    // 4. Cyan Rim Light - futuristic Stark aesthetic edge highlight
    const cyanRimLight = new THREE.DirectionalLight(0x06b6d4, 0.7);
    cyanRimLight.position.set(-35, 25, -35);
    this.scene.add(cyanRimLight);
  }

  createRooftopArena() {
    this.rooftopGroup = new THREE.Group();
    this.rooftopGroup.position.y = 0;
    this.scene.add(this.rooftopGroup);

    // --- 1. Architectural Slate Paving Texture (Lightweight 512x512) ---
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, 412, 412);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, 392, 392);

    const deckTex = new THREE.CanvasTexture(canvas);
    deckTex.generateMipmaps = false;
    deckTex.minFilter = THREE.LinearFilter;
    deckTex.magFilter = THREE.LinearFilter;
    deckTex.anisotropy = 1;

    // Main Rooftop Arena Deck
    const deckGeo = new THREE.BoxGeometry(45, 1.8, 45);
    const deckMat = new THREE.MeshStandardMaterial({
      map: deckTex,
      roughness: 0.45,
      metalness: 0.3
    });
    const deckMesh = new THREE.Mesh(deckGeo, deckMat);
    deckMesh.position.y = -0.9;
    this.rooftopGroup.add(deckMesh);

    // Glowing Cyan Perimeter Trim
    const trimGeo = new THREE.BoxGeometry(45.6, 0.25, 45.6);
    const trimMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = 0.02;
    this.rooftopGroup.add(trimMesh);

    // --- 2. Neat Manicured Lawn Aprons Framing the 100-Tile Board (256x256) ---
    const grassCanvas = document.createElement('canvas');
    grassCanvas.width = 256;
    grassCanvas.height = 256;
    const gCtx = grassCanvas.getContext('2d');

    gCtx.fillStyle = '#14532d';
    gCtx.fillRect(0, 0, 256, 256);

    gCtx.fillStyle = 'rgba(22, 163, 74, 0.25)';
    for (let y = 0; y < 256; y += 32) {
      gCtx.fillRect(0, y, 256, 16);
    }

    const grassTex = new THREE.CanvasTexture(grassCanvas);
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(4, 4);
    grassTex.generateMipmaps = false;
    grassTex.minFilter = THREE.LinearFilter;

    const grassMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.8,
      metalness: 0.05
    });

    const curbMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.6
    });

    const lawnConfigs = [
      { w: 43, d: 5.5, x: 0, z: -18.2 }, // North lawn
      { w: 43, d: 5.5, x: 0, z: 18.2 },  // South lawn
      { w: 5.5, d: 31, x: 18.2, z: 0 },   // East lawn
      { w: 5.5, d: 31, x: -18.2, z: 0 }   // West lawn
    ];

    lawnConfigs.forEach(lc => {
      const lawn = new THREE.Mesh(new THREE.BoxGeometry(lc.w, 0.12, lc.d), grassMat);
      lawn.position.set(lc.x, 0.06, lc.z);
      this.rooftopGroup.add(lawn);

      const curbGeo = new THREE.BoxGeometry(lc.w + 0.3, 0.18, lc.d + 0.3);
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(lc.x, 0.03, lc.z);
      this.rooftopGroup.add(curb);
    });

    // --- 3. Sleek Minimalist Corner Observation Plazas (Trees Removed for Max FPS) ---
    const cornerPlazaMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.4
    });

    const cornerRimMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4
    });

    const cornerNexusMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide
    });

    const cornerGoldMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide
    });

    const cornerCoords = [
      { x: -16.8, z: -16.8, isCyan: true },
      { x: 16.8, z: -16.8, isCyan: false },
      { x: 16.8, z: 16.8, isCyan: true },
      { x: -16.8, z: 16.8, isCyan: false }
    ];

    cornerCoords.forEach((cc) => {
      const cornerGroup = new THREE.Group();
      cornerGroup.position.set(cc.x, 0, cc.z);
      this.rooftopGroup.add(cornerGroup);

      // Low-poly architectural corner pedestal
      const ped = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.45, 3.6), cornerPlazaMat);
      ped.position.y = 0.23;
      cornerGroup.add(ped);

      // Neon perimeter ring
      const rim = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.06, 3.7), cornerRimMat);
      rim.position.y = 0.48;
      cornerGroup.add(rim);

      // Glowing nexus ring emblem
      const emblem = new THREE.Mesh(
        new THREE.RingGeometry(0.5, 0.85, 16),
        cc.isCyan ? cornerNexusMat : cornerGoldMat
      );
      emblem.rotation.x = -Math.PI / 2;
      emblem.position.y = 0.50;
      cornerGroup.add(emblem);
    });

    // --- 4. DUAL SYMMETRICAL REFLECTION WATER BASINS (WEST & EAST) ---
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.08,
      metalness: 0.9,
      transparent: true,
      opacity: 0.88
    });

    const lilyPadMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.6
    });

    const lotusWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfbcfe8,
      emissiveIntensity: 0.4,
      roughness: 0.3
    });

    const planterStoneMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.5
    });

    [-18.2, 18.2].forEach((poolX, pIdx) => {
      const poolGroup = new THREE.Group();
      poolGroup.position.set(poolX, 0.15, 0);
      this.rooftopGroup.add(poolGroup);

      // Stone border rim
      const poolRim = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.26, 13.5), planterStoneMat);
      poolRim.position.y = 0.08;
      poolGroup.add(poolRim);

      // Reflective Water Surface
      const poolWater = new THREE.Mesh(new THREE.PlaneGeometry(4.1, 13.0), waterMat);
      poolWater.rotation.x = -Math.PI / 2;
      poolWater.position.y = 0.17;
      poolGroup.add(poolWater);

      // Register water pools as interactive targets
      this.interactiveObjects.push({
        mesh: poolWater,
        type: 'water',
        worldPos: poolGroup.position
      });

      // Symmetrical Floating Water Lily Pads & Lotus Flowers
      [-4.2, -1.4, 1.4, 4.2].forEach((lz, idx) => {
        const xOffset = (idx % 2 === 0 ? -0.5 : 0.5);
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.03, 10), lilyPadMat);
        pad.position.set(xOffset, 0.19, lz);
        poolGroup.add(pad);

        const lotus = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 6), lotusWhiteMat);
        lotus.position.set(xOffset, 0.26, lz);
        poolGroup.add(lotus);
      });
    });

    // --- 5. CLEAN MINIMALIST PAGODA LANTERNS ---
    const lanternMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 });
    const lanternGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    [[-16.8, -13], [16.8, -13], [-16.8, 13], [16.8, 13]].forEach(([lx, lz]) => {
      const lanternGroup = new THREE.Group();
      lanternGroup.position.set(lx, 0.15, lz);
      this.rooftopGroup.add(lanternGroup);

      const lBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.7), lanternMat);
      lBase.position.y = 0.2;
      lanternGroup.add(lBase);

      const lGlow = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), lanternGlowMat);
      lGlow.position.y = 0.65;
      lanternGroup.add(lGlow);

      const lRoof = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.35, 4), lanternMat);
      lRoof.position.y = 1.05;
      lRoof.rotation.y = Math.PI / 4;
      lanternGroup.add(lRoof);
    });

    // --- 6. TEMPERED GLASS SAFETY RAILINGS ---
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.25,
      roughness: 0.2,
      metalness: 0.8
    });
    const postMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.3,
      metalness: 0.7
    });

    const createRailingSide = (x, z, length, isZAligned) => {
      const panelGeo = isZAligned
        ? new THREE.BoxGeometry(0.08, 1.4, length)
        : new THREE.BoxGeometry(length, 1.4, 0.08);
      const panel = new THREE.Mesh(panelGeo, railMat);
      panel.position.set(x, 0.7, z);
      this.rooftopGroup.add(panel);

      const numPosts = 4;
      for (let i = 0; i <= numPosts; i++) {
        const offset = (i / numPosts - 0.5) * length;
        const px = isZAligned ? x : x + offset;
        const pz = isZAligned ? z + offset : z;

        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 6), postMat);
        post.position.set(px, 0.75, pz);
        this.rooftopGroup.add(post);
      }
    };

    createRailingSide(0, 22.5, 45, false);
    createRailingSide(0, -22.5, 45, false);
    createRailingSide(22.5, 0, 45, true);
    createRailingSide(-22.5, 0, 45, true);

    // Corner beacon masts
    [-20, 20].forEach(cx => {
      [-20, 20].forEach(cz => {
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 4.2, 6), postMat);
        mast.position.set(cx, 3.7, cz);
        this.rooftopGroup.add(mast);

        const beacon = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 6, 6),
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

    // Procedural Window Grid Texture (Optimized 256x256)
    const winCanvas = document.createElement('canvas');
    winCanvas.width = 256;
    winCanvas.height = 256;
    const wCtx = winCanvas.getContext('2d');

    wCtx.fillStyle = '#090d16';
    wCtx.fillRect(0, 0, 256, 256);

    const cols = 16;
    const rows = 16;
    const padX = 256 / cols;
    const padY = 256 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rand = (Math.sin(r * 43.1 + c * 17.7) + 1) * 0.5;
        if (rand > 0.45) {
          wCtx.fillStyle = rand > 0.8 ? '#fef08a' : rand > 0.65 ? '#bae6fd' : '#fed7aa';
          wCtx.fillRect(c * padX + 2, r * padY + 2, padX - 4, padY - 4);
        } else {
          wCtx.fillStyle = '#0f172a';
          wCtx.fillRect(c * padX + 2, r * padY + 2, padX - 4, padY - 4);
        }
      }
    }

    const windowTex = new THREE.CanvasTexture(winCanvas);
    windowTex.wrapS = THREE.RepeatWrapping;
    windowTex.wrapT = THREE.RepeatWrapping;
    windowTex.generateMipmaps = false;
    windowTex.minFilter = THREE.LinearFilter;

    const bldgMat = new THREE.MeshStandardMaterial({
      map: windowTex,
      roughness: 0.35,
      metalness: 0.6
    });

    const darkBldgMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8
    });

    // 16 Surrounding 3D Skyscraper Towers
    const towerConfigs = [
      { x: -35, z: -55, w: 16, d: 16, h: 75, name: 'STARK' },
      { x: -10, z: -65, w: 18, d: 18, h: 90 },
      { x: 15, z: -60, w: 14, d: 14, h: 78, name: 'OSCORP' },
      { x: 38, z: -52, w: 15, d: 15, h: 68 },
      { x: -55, z: -45, w: 16, d: 16, h: 62 },

      { x: 55, z: -30, w: 14, d: 14, h: 72 },
      { x: 62, z: -5, w: 18, d: 16, h: 84, name: 'BUGLE' },
      { x: 56, z: 20, w: 15, d: 15, h: 65 },

      { x: 32, z: 58, w: 15, d: 15, h: 52 },
      { x: 5, z: 64, w: 18, d: 18, h: 48 },
      { x: -22, z: 60, w: 14, d: 14, h: 54 },
      { x: -46, z: 52, w: 16, d: 16, h: 46 },

      { x: -58, z: 30, w: 15, d: 15, h: 66 },
      { x: -64, z: 5, w: 18, d: 18, h: 82 },
      { x: -58, z: -20, w: 15, d: 15, h: 70 },

      { x: -75, z: -70, w: 22, d: 22, h: 105 },
      { x: 80, z: -75, w: 24, d: 24, h: 110 }
    ];

    towerConfigs.forEach(cfg => {
      const towerGroup = new THREE.Group();
      towerGroup.position.set(cfg.x, -cfg.h / 2 + 15, cfg.z);
      this.skylineGroup.add(towerGroup);

      const towerGeo = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d);
      const mesh = new THREE.Mesh(towerGeo, bldgMat);
      towerGroup.add(mesh);

      const setbackH = cfg.h * 0.35;
      const setbackGeo = new THREE.BoxGeometry(cfg.w * 0.72, setbackH, cfg.d * 0.72);
      const setback = new THREE.Mesh(setbackGeo, bldgMat);
      setback.position.y = cfg.h / 2 + setbackH / 2;
      towerGroup.add(setback);

      const spireH = 10;
      const spireGeo = new THREE.CylinderGeometry(0.15, 0.9, spireH, 6);
      const spire = new THREE.Mesh(spireGeo, darkBldgMat);
      spire.position.y = cfg.h / 2 + setbackH + spireH / 2;
      towerGroup.add(spire);

      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), beaconMat);
      beacon.position.y = cfg.h / 2 + setbackH + spireH;
      towerGroup.add(beacon);
      this.beacons.push(beacon);

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
    const archGeo = new THREE.CylinderGeometry(5.0, 5.0, 1.0, 16, 1, false, 0, Math.PI);
    const neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const arch = new THREE.Mesh(archGeo, neonCyanMat);
    arch.rotation.z = Math.PI / 2;
    arch.rotation.y = Math.PI / 4;
    arch.position.set(0, topY + 4, 0);
    parentGroup.add(arch);

    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 64;
    const sCtx = signCanvas.getContext('2d');
    sCtx.fillStyle = '#090d16';
    sCtx.fillRect(0, 0, 256, 64);
    sCtx.font = '900 42px "Outfit", sans-serif';
    sCtx.fillStyle = '#38bdf8';
    sCtx.textAlign = 'center';
    sCtx.fillText('STARK', 128, 48);

    const signTex = new THREE.CanvasTexture(signCanvas);
    signTex.generateMipmaps = false;
    const signGeo = new THREE.PlaneGeometry(10, 2.5);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, topY + 8, 3.5);
    parentGroup.add(sign);
  }

  createOscorpTowerFeatures(parentGroup, topY) {
    const spireGlowGeo = new THREE.ConeGeometry(2.2, 12, 6);
    const emeraldMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const spireGlow = new THREE.Mesh(spireGlowGeo, emeraldMat);
    spireGlow.position.set(0, topY + 7, 0);
    parentGroup.add(spireGlow);

    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 64;
    const sCtx = signCanvas.getContext('2d');
    sCtx.fillStyle = '#022c22';
    sCtx.fillRect(0, 0, 256, 64);
    sCtx.font = '900 36px "Outfit", sans-serif';
    sCtx.fillStyle = '#10b981';
    sCtx.textAlign = 'center';
    sCtx.fillText('OSCORP', 128, 48);

    const signTex = new THREE.CanvasTexture(signCanvas);
    signTex.generateMipmaps = false;
    const signGeo = new THREE.PlaneGeometry(9, 2.4);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, topY + 6, 3.0);
    parentGroup.add(sign);
  }

  createDailyBugleFeatures(parentGroup, topY) {
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 64;
    const sCtx = signCanvas.getContext('2d');
    sCtx.fillStyle = '#450a0a';
    sCtx.fillRect(0, 0, 256, 64);
    sCtx.font = '900 30px "Outfit", Impact, sans-serif';
    sCtx.fillStyle = '#ef4444';
    sCtx.textAlign = 'center';
    sCtx.fillText('DAILY BUGLE', 128, 46);

    const signTex = new THREE.CanvasTexture(signCanvas);
    signTex.generateMipmaps = false;
    const signGeo = new THREE.PlaneGeometry(10, 2.5);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, topY + 7, 3.5);
    parentGroup.add(sign);
  }

  createSearchlights() {
    const searchlightPositions = [
      { x: -35, y: 38, z: -55, color: 0x38bdf8, baseAngle: 0 },
      { x: 62, y: 44, z: -5, color: 0xfef08a, baseAngle: Math.PI / 2 }
    ];

    searchlightPositions.forEach((pos, idx) => {
      const group = new THREE.Group();
      group.position.set(pos.x, pos.y, pos.z);
      this.scene.add(group);

      const housing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 1.0, 1.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
      );
      housing.rotation.x = Math.PI / 2;
      group.add(housing);

      const coneGeo = new THREE.ConeGeometry(8, 70, 12, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: pos.color,
        transparent: true,
        opacity: 0.14,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const beam = new THREE.Mesh(coneGeo, coneMat);
      beam.position.y = 35;
      group.add(beam);

      this.searchlights.push({
        group,
        baseAngle: pos.baseAngle,
        speed: 0.5 + idx * 0.15
      });
    });
  }

  createSkyDome() {
    const skyGeo = new THREE.SphereGeometry(180, 16, 12);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Rich Anime Twilight Gradient (Deep Midnight Indigo to Radiant Anime Violet)
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#030712'); // Deep void
    grad.addColorStop(0.35, '#0f172a'); // Midnight slate
    grad.addColorStop(0.70, '#1e1b4b'); // Anime twilight indigo
    grad.addColorStop(1.0, '#312e81'); // Vibrant anime horizon glow
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Glowing Anime Crescent Moon in Upper Sky
    const moonX = 390;
    const moonY = 65;
    const moonRadius = 24;

    // Outer soft moon halo
    const moonHalo = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 60);
    moonHalo.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    moonHalo.addColorStop(0.5, 'rgba(199, 210, 254, 0.20)');
    moonHalo.addColorStop(1, 'rgba(49, 46, 129, 0)');
    ctx.fillStyle = moonHalo;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 60, 0, Math.PI * 2);
    ctx.fill();

    // Sharp Anime Crescent Moon
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2, false);
    ctx.fill();
    // Cut-out for crescent shape
    ctx.fillStyle = '#0a1024';
    ctx.beginPath();
    ctx.arc(moonX + 9, moonY - 5, moonRadius * 0.92, 0, Math.PI * 2, false);
    ctx.fill();

    // Twinkling Anime Stars & 4-point Sparkles
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 160; i++) {
      const x = (i * 73 + 19) % 512;
      const y = (i * 37 + 11) % 180;
      const r = (i % 5 === 0) ? 1.6 : (i % 2 === 0) ? 1.1 : 0.7;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Anime 4-point sparkle cross on bright stars
      if (i % 12 === 0) {
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x + 5, y);
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x, y + 5);
        ctx.stroke();
      }
    }

    const skyTex = new THREE.CanvasTexture(canvas);
    skyTex.generateMipmaps = false;
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide
    });
    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);
  }

  createFireflies() {
    const count = 20; // Lightweight ambient glow particles
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = 0.5 + Math.random() * 3.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 36;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.5 + Math.random() * 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.45,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.fireflyPoints = new THREE.Points(geo, mat);
    this.scene.add(this.fireflyPoints);
    this.fireflyData = { positions, phases, speeds, count };
  }

  setupInteractivity() {
    if (!this.domElement || !this.camera) return;

    this.onPointerDown = (e) => {
      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const candidateMeshes = this.interactiveObjects.map(io => io.mesh);
      const intersects = this.raycaster.intersectObjects(candidateMeshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const io = this.interactiveObjects.find(obj => obj.mesh === hit.object);
        if (io && io.type === 'water') {
          this.spawnWaterRipple(hit.point.x, hit.point.z);
          if (this.audioManager?.playWaterDrop) this.audioManager.playWaterDrop();
        }
      }
    };

    this.domElement.addEventListener('pointerdown', this.onPointerDown);
  }

  spawnWaterRipple(x, z) {
    const ringGeo = new THREE.RingGeometry(0.12, 0.22, 16);
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
      maxLife: 1.4,
      scaleMax: 3.5
    });
  }

  update(delta) {
    this.animTime += delta;

    // 1. Searchlights simple sweep
    this.searchlights.forEach((sl, idx) => {
      const sweep = Math.sin(this.animTime * sl.speed + sl.baseAngle) * 0.35;
      const tilt = 0.5 + Math.cos(this.animTime * (sl.speed * 0.8) + idx) * 0.2;
      sl.group.rotation.y = sl.baseAngle + sweep;
      sl.group.rotation.x = tilt;
    });

    // 2. Pulse red aviation hazard beacons
    const flash = Math.sin(this.animTime * 3.5) > 0 ? 0xff2222 : 0x330000;
    this.beacons.forEach(b => {
      b.material.color.setHex(flash);
    });

    // Slow celestial rotation of anime starry sky dome
    if (this.skyMesh) {
      this.skyMesh.rotation.y += delta * 0.006;
    }

    // 3. Fireflies subtle drift (only 20 particles)
    if (this.fireflyPoints && this.fireflyData) {
      const { positions, phases, speeds, count } = this.fireflyData;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        phases[i] += delta * speeds[i];
        positions[i3 + 1] += Math.sin(phases[i]) * 0.012;
      }
      this.fireflyPoints.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Interactive Water Ripples Animation
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
        const s = THREE.MathUtils.lerp(0.5, r.scaleMax, progress);
        r.mesh.scale.set(s, s, s);
        r.mesh.material.opacity = Math.max(0, 0.7 * (1 - progress));
      }
    }
  }
}
