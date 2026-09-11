// ==========================================================================
// ENVIRONMENT - Masterpiece Cinematic Manhattan Penthouse Helipad Arena
// 3D Illuminated Manhattan Skyline, Iconic Stark / Oscorp / Bugle Towers,
// Animated Sweeping Searchlights, Aviation Hazard Beacons & Midnight Atmosphere
// ==========================================================================

import * as THREE from 'three';

export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.searchlights = [];
    this.beacons = [];
    this.animTime = 0;

    this.createLights();
    this.createRooftopHelipad();
    this.create3DSkyscraperSkyline();
    this.createSearchlights();
    this.createSkyDome();
  }

  createLights() {
    // 1. Ambient Light - soft cool midnight fill
    const ambientLight = new THREE.AmbientLight(0x384252, 1.6);
    this.scene.add(ambientLight);

    // 2. Main Key Light - cool silvery moonlight angled from upper Manhattan
    const moonKeyLight = new THREE.DirectionalLight(0xdbeafe, 1.8);
    moonKeyLight.position.set(30, 55, 35);
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

  createRooftopHelipad() {
    this.rooftopGroup = new THREE.Group();
    this.rooftopGroup.position.y = 0;
    this.scene.add(this.rooftopGroup);

    // --- High-Tech Helipad Canvas Texture ---
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Dark architectural granite tiles
    ctx.fillStyle = '#0c121e';
    ctx.fillRect(0, 0, 1024, 1024);

    // Tile grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
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

    // Outer Neon Cyan Perimeter Octagon
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(512, 512, 470, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Warning Yellow Dashed Ring
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 10;
    ctx.setLineDash([28, 20]);
    ctx.beginPath();
    ctx.arc(512, 512, 430, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Stark / Helipad Giant Center 'H'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 32;
    ctx.beginPath();
    // Left vertical bar
    ctx.moveTo(370, 310);
    ctx.lineTo(370, 714);
    // Right vertical bar
    ctx.moveTo(654, 310);
    ctx.lineTo(654, 714);
    // Crossbar
    ctx.moveTo(370, 512);
    ctx.lineTo(654, 512);
    ctx.stroke();

    // Corner Helipad Hazard Stripes
    const drawHazardStripe = (x, y, w, h) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 14;
      for (let i = -w; i < w + h; i += 32) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i + h, y + h);
        ctx.stroke();
      }
      ctx.restore();
    };

    drawHazardStripe(40, 40, 180, 40);
    drawHazardStripe(804, 40, 180, 40);
    drawHazardStripe(40, 944, 180, 40);
    drawHazardStripe(804, 944, 180, 40);

    const helipadTex = new THREE.CanvasTexture(canvas);
    helipadTex.anisotropy = 8;

    // Main Rooftop Helipad Deck
    const deckGeo = new THREE.BoxGeometry(44, 1.8, 44);
    const deckMat = new THREE.MeshStandardMaterial({
      map: helipadTex,
      roughness: 0.45,
      metalness: 0.35
    });
    const deckMesh = new THREE.Mesh(deckGeo, deckMat);
    deckMesh.position.y = -0.9;
    this.rooftopGroup.add(deckMesh);

    // Glowing Neon Perimeter Border Trim
    const trimGeo = new THREE.BoxGeometry(44.6, 0.25, 44.6);
    const trimMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = 0.02;
    this.rooftopGroup.add(trimMesh);

    // Tempered Glass Safety Railing with Glowing Neon Stanchions
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.35,
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

      // Stanchion posts
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

    // Rooftop HVAC units, vents & satellite dishes on outer perimeter
    this.createRooftopProps();
  }

  createRooftopProps() {
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.8
    });
    const fanGlowMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });

    // 4 Corner HVAC vent installations
    const corners = [
      { x: -19, z: -19 },
      { x: 19, z: -19 },
      { x: -19, z: 19 },
      { x: 19, z: 19 }
    ];

    corners.forEach(c => {
      const hvac = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 2.4), metalMat);
      hvac.position.set(c.x, 0.8, c.z);
      this.rooftopGroup.add(hvac);

      // Top exhaust fan vent
      const fanRing = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.15, 12), metalMat);
      fanRing.position.set(c.x, 1.68, c.z);
      this.rooftopGroup.add(fanRing);

      const fanGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.05, 12), fanGlowMat);
      fanGlow.position.set(c.x, 1.72, c.z);
      this.rooftopGroup.add(fanGlow);

      // Antenna mast with blinking red aviation warning beacon
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 4.2, 8), metalMat);
      mast.position.set(c.x, 3.7, c.z);
      this.rooftopGroup.add(mast);

      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), beaconMat);
      beacon.position.set(c.x, 5.8, c.z);
      this.rooftopGroup.add(beacon);
      this.beacons.push(beacon);
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

  update(delta) {
    this.animTime += delta;

    // 1. Sweep architectural searchlight beams across the night clouds
    this.searchlights.forEach((sl, idx) => {
      const sweep = Math.sin(this.animTime * sl.speed + sl.baseAngle) * 0.45;
      const tilt = 0.5 + Math.cos(this.animTime * (sl.speed * 0.8) + idx) * 0.25;

      sl.group.rotation.y = sl.baseAngle + sweep;
      sl.group.rotation.x = tilt;
      sl.group.rotation.z = Math.sin(this.animTime * sl.speed * 0.5) * 0.15;
    });

    // 2. Pulse red aviation hazard beacons atop skyscrapers and helipad masts
    const flash = Math.sin(this.animTime * 4.0) > 0.2 ? 1.0 : 0.15;
    this.beacons.forEach(b => {
      b.material.color.setHex(flash > 0.5 ? 0xff2222 : 0x440000);
    });
  }
}
