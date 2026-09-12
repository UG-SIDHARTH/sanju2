// ==========================================================================
// AURA MANAGER - Japanese / Chinese Celestial Anime Aura & Flowing Qi Engine
// Flowing Dragon Spirit Ribbons, Falling Sakura Petals, Ethereal Ground Mist,
// Multilayer Character Energy Flames, Celestial Magic Mandalas & Anime Speed Lines
// ==========================================================================

import * as THREE from 'three';

export class AuraManager {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.animTime = 0;
    this.speedLinesActive = false;
    this.speedLinesIntensity = 0;
    this.characterAuras = [];

    this.setupSpeedLinesCanvas();
    this.createAmbientAnimeQiParticles();
    this.createFlowingQiRibbons();
    this.createFallingSakuraAndMotes();
    this.createGroundSpiritMist();
    this.createBoardAuraPerimeter();
  }

  // --- 1. AMBIENT ANIME QI & SPIRITUAL ENERGY MOTES ---
  createAmbientAnimeQiParticles() {
    this.qiCount = 180;
    this.qiGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.qiCount * 3);
    const colors = new Float32Array(this.qiCount * 3);
    const sizes = new Float32Array(this.qiCount);
    this.qiVelocities = [];

    // Aesthetic anime palette: Celestial Cyan, Mystic Amethyst, Golden Spirit, Sakura Blossom
    const palette = [
      new THREE.Color(0x38bdf8), // Celestial Cyan Spirit Qi
      new THREE.Color(0xa855f7), // Mystic Purple Qi
      new THREE.Color(0xf59e0b), // Golden Radiant Aura
      new THREE.Color(0xf472b6), // Sakura Blossom Mote
      new THREE.Color(0x06b6d4)  // Stark Cyan Plasma
    ];

    for (let i = 0; i < this.qiCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 46;
      positions[i * 3 + 1] = 0.5 + Math.random() * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 46;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = 0.35 + Math.random() * 0.55;

      this.qiVelocities.push({
        vx: (Math.random() - 0.5) * 0.45,
        vy: 0.38 + Math.random() * 0.65, // Flowing upward celestial spirit aura
        vz: (Math.random() - 0.5) * 0.45,
        phase: Math.random() * Math.PI * 2,
        freq: 1.2 + Math.random() * 2.2
      });
    }

    this.qiGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.qiGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.qiGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const texture = this.createAuraMoteTexture();

    this.qiMaterial = new THREE.PointsMaterial({
      size: 0.65,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.qiPoints = new THREE.Points(this.qiGeometry, this.qiMaterial);
    this.scene.add(this.qiPoints);
  }

  createAuraMoteTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  // --- 2. FLOWING CELESTIAL QI SILK RIBBONS (DRAGON SPIRIT STREAMS) ---
  createFlowingQiRibbons() {
    this.qiRibbons = [];

    const ribbonConfigs = [
      // Ribbon 1: Celestial Cyan Dragon stream looping high over the board
      {
        color: 0x38bdf8,
        points: [
          new THREE.Vector3(-22, 5, -20),
          new THREE.Vector3(-10, 10, -5),
          new THREE.Vector3(12, 8, 10),
          new THREE.Vector3(24, 6, -12),
          new THREE.Vector3(0, 12, -22),
          new THREE.Vector3(-22, 5, -20)
        ],
        width: 0.75,
        speed: 0.45
      },
      // Ribbon 2: Golden Phoenix Qi stream encircling the board perimeter
      {
        color: 0xf59e0b,
        points: [
          new THREE.Vector3(20, 3, 20),
          new THREE.Vector3(22, 7, -18),
          new THREE.Vector3(-18, 9, -20),
          new THREE.Vector3(-20, 4, 18),
          new THREE.Vector3(20, 3, 20)
        ],
        width: 0.65,
        speed: 0.35
      },
      // Ribbon 3: Mystic Amethyst Spirit stream weaving through mid-air
      {
        color: 0xc084fc,
        points: [
          new THREE.Vector3(-15, 6, 15),
          new THREE.Vector3(0, 4, 18),
          new THREE.Vector3(16, 7, 0),
          new THREE.Vector3(0, 9, -15),
          new THREE.Vector3(-15, 6, 15)
        ],
        width: 0.55,
        speed: 0.55
      }
    ];

    // Ribbon texture with smooth glowing gradient bands
    const rCanvas = document.createElement('canvas');
    rCanvas.width = 512;
    rCanvas.height = 64;
    const rCtx = rCanvas.getContext('2d');
    const grad = rCtx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
    rCtx.fillStyle = grad;
    rCtx.fillRect(0, 0, 512, 64);
    const ribbonTex = new THREE.CanvasTexture(rCanvas);
    ribbonTex.wrapS = THREE.RepeatWrapping;
    ribbonTex.wrapT = THREE.ClampToEdgeWrapping;

    ribbonConfigs.forEach(cfg => {
      const curve = new THREE.CatmullRomCurve3(cfg.points, true);
      const tubeGeo = new THREE.TubeGeometry(curve, 64, cfg.width, 6, true);

      const tubeMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        map: ribbonTex,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const ribbonMesh = new THREE.Mesh(tubeGeo, tubeMat);
      this.scene.add(ribbonMesh);

      this.qiRibbons.push({
        mesh: ribbonMesh,
        speed: cfg.speed,
        baseY: ribbonMesh.position.y
      });
    });
  }

  // --- 3. FALLING ANIME SAKURA PETALS & CELESTIAL MOTES ---
  createFallingSakuraAndMotes() {
    this.sakuraCount = 90;
    this.sakuraGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.sakuraCount * 3);
    const colors = new Float32Array(this.sakuraCount * 3);
    this.sakuraData = [];

    const sakuraColors = [
      new THREE.Color(0xf472b6), // Sakura Soft Pink
      new THREE.Color(0xfb7185), // Crimson Sakura Rose
      new THREE.Color(0xfef08a), // Starlight Golden Mote
      new THREE.Color(0x38bdf8)  // Celestial Cyan Drop
    ];

    for (let i = 0; i < this.sakuraCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 44;
      positions[i * 3 + 1] = 1.0 + Math.random() * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 44;

      const col = sakuraColors[Math.floor(Math.random() * sakuraColors.length)];
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      this.sakuraData.push({
        fallSpeed: 0.45 + Math.random() * 0.45,
        swaySpeed: 1.2 + Math.random() * 1.5,
        swayDist: 0.04 + Math.random() * 0.04,
        windX: 0.25 + Math.random() * 0.35, // Diagonal anime breeze
        phase: Math.random() * Math.PI * 2
      });
    }

    this.sakuraGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.sakuraGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Stylized sakura petal sprite
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    pCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    pCtx.beginPath();
    pCtx.ellipse(32, 32, 24, 12, Math.PI / 4, 0, Math.PI * 2);
    pCtx.fill();
    const petalTex = new THREE.CanvasTexture(pCanvas);

    const sakuraMat = new THREE.PointsMaterial({
      size: 0.55,
      vertexColors: true,
      map: petalTex,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.sakuraPoints = new THREE.Points(this.sakuraGeometry, sakuraMat);
    this.scene.add(this.sakuraPoints);
  }

  // --- 4. ETHEREAL GROUND SPIRIT MIST / CELESTIAL VAPOR ---
  createGroundSpiritMist() {
    this.mistGroup = new THREE.Group();
    this.scene.add(this.mistGroup);
    this.mistDiscs = [];

    // Soft celestial radial mist texture
    const mCanvas = document.createElement('canvas');
    mCanvas.width = 256;
    mCanvas.height = 256;
    const mCtx = mCanvas.getContext('2d');
    const mGrad = mCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    mGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    mGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.18)');
    mGrad.addColorStop(0.8, 'rgba(59, 130, 246, 0.08)');
    mGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    mCtx.fillStyle = mGrad;
    mCtx.fillRect(0, 0, 256, 256);
    const mistTex = new THREE.CanvasTexture(mCanvas);

    const discGeo = new THREE.PlaneGeometry(16, 16);
    const discMat = new THREE.MeshBasicMaterial({
      map: mistTex,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const positions = [
      { x: -10, z: -10, rotSpeed: 0.12 },
      { x: 10, z: 10, rotSpeed: -0.15 },
      { x: -8, z: 12, rotSpeed: 0.18 },
      { x: 12, z: -8, rotSpeed: -0.10 }
    ];

    positions.forEach(p => {
      const mesh = new THREE.Mesh(discGeo, discMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(p.x, 0.06, p.z);
      this.mistGroup.add(mesh);
      this.mistDiscs.push({ mesh, rotSpeed: p.rotSpeed, baseX: p.x, baseZ: p.z });
    });
  }

  // --- 5. BOARD AURA PERIMETER (PULSING SPIRIT ENERGY CURRENT) ---
  createBoardAuraPerimeter() {
    const size = 32.2;
    const borderPoints = [
      new THREE.Vector3(-size / 2, 0.08, -size / 2),
      new THREE.Vector3(size / 2, 0.08, -size / 2),
      new THREE.Vector3(size / 2, 0.08, size / 2),
      new THREE.Vector3(-size / 2, 0.08, size / 2),
      new THREE.Vector3(-size / 2, 0.08, -size / 2)
    ];

    const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPoints);
    this.boardBorderMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 3,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const borderLine = new THREE.Line(borderGeo, this.boardBorderMat);
    this.scene.add(borderLine);
  }

  // --- 6. SPECTACULAR MULTILAYER CHARACTER AURA (CELESTIAL MANDALA + FLAME) ---
  createCharacterAura(targetObject, colorHex = 0x38bdf8, scale = 1.0) {
    const auraGroup = new THREE.Group();
    auraGroup.name = 'CelestialAnimeAura';

    // Layer 1: Rotating Celestial Magic Mandala / Spirit Seal at feet
    const mandalaCanvas = document.createElement('canvas');
    mandalaCanvas.width = 256;
    mandalaCanvas.height = 256;
    const mCtx = mandalaCanvas.getContext('2d');

    mCtx.strokeStyle = '#ffffff';
    mCtx.lineWidth = 2.5;

    // Concentric celestial circles
    mCtx.beginPath();
    mCtx.arc(128, 128, 118, 0, Math.PI * 2);
    mCtx.arc(128, 128, 96, 0, Math.PI * 2);
    mCtx.stroke();

    // 8-pointed celestial star mandala
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      mCtx.beginPath();
      mCtx.moveTo(128 + Math.cos(a) * 96, 128 + Math.sin(a) * 96);
      mCtx.lineTo(128 + Math.cos(a + Math.PI / 4) * 118, 128 + Math.sin(a + Math.PI / 4) * 118);
      mCtx.stroke();
    }
    const mandalaTex = new THREE.CanvasTexture(mandalaCanvas);

    const sealGeo = new THREE.PlaneGeometry(1.9 * scale, 1.9 * scale);
    const sealMat = new THREE.MeshBasicMaterial({
      map: mandalaTex,
      color: colorHex,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const mandalaMesh = new THREE.Mesh(sealGeo, sealMat);
    mandalaMesh.rotation.x = -Math.PI / 2;
    mandalaMesh.position.y = 0.05;
    auraGroup.add(mandalaMesh);

    // Layer 2: Inner Flowing Anime Energy Flame Pillar
    const innerFlameGeo = new THREE.CylinderGeometry(0.55 * scale, 0.85 * scale, 2.2 * scale, 16, 1, true);
    const innerFlameMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);
    innerFlame.position.y = 1.1 * scale;
    auraGroup.add(innerFlame);

    // Layer 3: Outer Flowing Spirit Flame Shroud
    const outerFlameGeo = new THREE.CylinderGeometry(0.78 * scale, 1.05 * scale, 2.4 * scale, 16, 1, true);
    const outerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.20,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const outerFlame = new THREE.Mesh(outerFlameGeo, outerFlameMat);
    outerFlame.position.y = 1.2 * scale;
    auraGroup.add(outerFlame);

    targetObject.add(auraGroup);

    const auraInstance = {
      group: auraGroup,
      mandalaMesh,
      innerFlame,
      outerFlame,
      baseScale: scale,
      colorHex,
      rotSpeed: 0.8,
      pulsePhase: Math.random() * Math.PI * 2
    };

    this.characterAuras.push(auraInstance);
    return auraInstance;
  }

  // --- 7. FULLSCREEN ANIME SPEED LINES / ACTION FOCUS LINES OVERLAY ---
  setupSpeedLinesCanvas() {
    this.speedLinesCanvas = document.createElement('canvas');
    this.speedLinesCanvas.id = 'anime-speed-lines';
    this.speedLinesCanvas.style.position = 'fixed';
    this.speedLinesCanvas.style.top = '0';
    this.speedLinesCanvas.style.left = '0';
    this.speedLinesCanvas.style.width = '100%';
    this.speedLinesCanvas.style.height = '100%';
    this.speedLinesCanvas.style.pointerEvents = 'none';
    this.speedLinesCanvas.style.zIndex = '15';
    this.speedLinesCanvas.style.opacity = '0';
    this.speedLinesCanvas.style.transition = 'opacity 0.18s ease-out';

    document.body.appendChild(this.speedLinesCanvas);
    this.speedCtx = this.speedLinesCanvas.getContext('2d');

    this.resizeSpeedLines();
    window.addEventListener('resize', () => this.resizeSpeedLines());
  }

  resizeSpeedLines() {
    this.speedLinesCanvas.width = window.innerWidth;
    this.speedLinesCanvas.height = window.innerHeight;
  }

  triggerSpeedLines(duration = 1.2, intensity = 1.0) {
    this.speedLinesActive = true;
    this.speedLinesIntensity = intensity;
    this.speedLinesCanvas.style.opacity = `${Math.min(1.0, 0.85 * intensity)}`;

    setTimeout(() => {
      this.speedLinesActive = false;
      this.speedLinesCanvas.style.opacity = '0';
    }, duration * 1000);
  }

  renderSpeedLines() {
    if (!this.speedLinesActive || !this.speedCtx) return;

    const w = this.speedLinesCanvas.width;
    const h = this.speedLinesCanvas.height;
    const ctx = this.speedCtx;

    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.5;
    const linesCount = 75;
    const maxRadius = Math.hypot(cx, cy);
    const innerRadius = Math.min(w, h) * 0.26;

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.lineWidth = 2.2;

    for (let i = 0; i < linesCount; i++) {
      if (Math.random() > 0.40) continue;
      const angle = (i / linesCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
      const startR = innerRadius + Math.random() * (innerRadius * 0.5);
      const endR = maxRadius;

      const x1 = cx + Math.cos(angle) * startR;
      const y1 = cy + Math.sin(angle) * startR;
      const x2 = cx + Math.cos(angle) * endR;
      const y2 = cy + Math.sin(angle) * endR;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- 8. ANIMATION UPDATE LOOP ---
  update(delta) {
    this.animTime += delta;

    // 1. Upward swirling ambient spiritual Qi motes
    if (this.qiGeometry) {
      const pos = this.qiGeometry.attributes.position.array;
      for (let i = 0; i < this.qiCount; i++) {
        const vel = this.qiVelocities[i];

        pos[i * 3 + 0] += Math.sin(this.animTime * vel.freq + vel.phase) * 0.035;
        pos[i * 3 + 1] += vel.vy * delta * 2.4;
        pos[i * 3 + 2] += Math.cos(this.animTime * vel.freq + vel.phase) * 0.035;

        if (pos[i * 3 + 1] > 18) {
          pos[i * 3 + 1] = 0.5;
          pos[i * 3 + 0] = (Math.random() - 0.5) * 46;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 46;
        }
      }
      this.qiGeometry.attributes.position.needsUpdate = true;
    }

    // 2. Flowing Qi Silk Ribbons undulation & UV flow
    if (this.qiRibbons) {
      this.qiRibbons.forEach(r => {
        if (r.mesh.material.map) {
          r.mesh.material.map.offset.x -= delta * r.speed;
        }
        r.mesh.position.y = r.baseY + Math.sin(this.animTime * 1.5) * 0.35;
      });
    }

    // 3. Falling Anime Sakura Petals & Celestial Motes
    if (this.sakuraGeometry) {
      const sPos = this.sakuraGeometry.attributes.position.array;
      for (let i = 0; i < this.sakuraCount; i++) {
        const d = this.sakuraData[i];
        sPos[i * 3 + 1] -= d.fallSpeed * delta * 2.2;
        sPos[i * 3 + 0] += d.windX * delta * 1.8 + Math.sin(this.animTime * d.swaySpeed + d.phase) * d.swayDist;
        sPos[i * 3 + 2] += Math.cos(this.animTime * d.swaySpeed + d.phase) * d.swayDist;

        // Reset if reached floor or drifted out
        if (sPos[i * 3 + 1] < 0.2 || sPos[i * 3 + 0] > 26) {
          sPos[i * 3 + 1] = 16.0;
          sPos[i * 3 + 0] = -24.0 + (Math.random() - 0.5) * 20;
          sPos[i * 3 + 2] = (Math.random() - 0.5) * 44;
        }
      }
      this.sakuraGeometry.attributes.position.needsUpdate = true;
    }

    // 4. Ethereal Ground Spirit Mist rotation
    if (this.mistDiscs) {
      this.mistDiscs.forEach(m => {
        m.mesh.rotation.z += delta * m.rotSpeed;
        const sway = Math.sin(this.animTime * 0.8) * 0.4;
        m.mesh.position.x = m.baseX + sway;
      });
    }

    // 5. Board Aura Perimeter Pulsing
    if (this.boardBorderMat) {
      this.boardBorderMat.opacity = 0.55 + Math.sin(this.animTime * 3.0) * 0.35;
    }

    // 6. Character Auras: Mandala rotation & Flame breathing
    if (this.characterAuras && this.characterAuras.length > 0) {
      this.characterAuras.forEach(aura => {
        if (!aura.group.parent) return;

        // Rotate magic mandala
        if (aura.mandalaMesh) {
          aura.mandalaMesh.rotation.z += delta * aura.rotSpeed;
        }

        // Pulse inner & outer flame
        const pulse = Math.sin(this.animTime * 3.5 + aura.pulsePhase) * 0.08;
        if (aura.innerFlame) {
          aura.innerFlame.scale.set(1.0 + pulse, 1.0 + pulse * 1.2, 1.0 + pulse);
          aura.innerFlame.rotation.y += delta * 1.2;
        }
        if (aura.outerFlame) {
          aura.outerFlame.scale.set(1.0 - pulse * 0.8, 1.0 + pulse * 0.6, 1.0 - pulse * 0.8);
          aura.outerFlame.rotation.y -= delta * 0.9;
        }
      });
    }

    // 7. Fullscreen speedlines overlay
    if (this.speedLinesActive) {
      this.renderSpeedLines();
    }
  }
}
