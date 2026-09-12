// ==========================================================================
// BOARD - High-Visibility, Razor-Sharp 100-Tile Serpentine Grid
// Rendered at 512x512 resolution with anisotropic filtering for zero blur
// ==========================================================================

import * as THREE from 'three';

export class Board {
  constructor(scene, maxAnisotropy = 8) {
    this.scene = scene;
    this.maxAnisotropy = maxAnisotropy;
    this.tiles = [];
    this.tileMeshes = [];
    this.tileSize = 2.8;
    this.tileGap = 0.22;
    this.tileThickness = 0.35;
    this.boardGroup = new THREE.Group();

    this.maxTiles = 100;
    this.specialMarkers = {
      spideyTriggers: [],
      goblins: []
    };
    this.goalLabel = '🐙 TILE 100';

    this.createBoardPlatform();
    this.generateTiles();
    this.scene.add(this.boardGroup);
  }

  setGameMode(maxTiles = 100) {
    this.maxTiles = maxTiles === 60 ? 60 : 100;
    this.goalLabel = `🐙 TILE ${this.maxTiles}`;

    const goalPos = this.tiles[this.maxTiles].position;
    if (this.goalRing) {
      this.goalRing.position.set(goalPos.x, goalPos.y + 0.05, goalPos.z);
    }

    for (let n = 1; n <= 100; n++) {
      const tile = this.tiles[n];
      if (!tile) continue;

      if (n > this.maxTiles) {
        // Dim unused tiles beyond maxTiles
        tile.mesh.material.forEach(m => {
          m.transparent = true;
          m.opacity = 0.18;
        });
      } else {
        tile.mesh.material.forEach(m => {
          m.transparent = false;
          m.opacity = 1.0;
        });
      }
    }
  }

  createBoardPlatform() {
    const baseWidth = (this.tileSize + this.tileGap) * 10 + 1.6;
    const baseGeo = new THREE.BoxGeometry(baseWidth, 0.8, baseWidth);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x090d16 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.4;
    this.boardGroup.add(baseMesh);

    // Sleek architectural dark titanium border rim
    const rimGeo = new THREE.BoxGeometry(baseWidth + 0.25, 0.12, baseWidth + 0.25);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.35,
      metalness: 0.8
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = 0.02;
    this.boardGroup.add(rimMesh);
  }

  // 256x256 high-clarity, lightweight tile textures (Optimized for 4GB RAM & Intel iGPU)
  // 256x256 high-clarity, lightweight tile textures (Optimized for 4GB RAM & Intel iGPU)
  createTileTexture(number, isSpideyTrigger = false, isGoblin = false, isGoal = false, isPortalEntrance = false, portalDest = null, isPortalExit = false, portalFrom = null) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;

    const isEven = (Math.floor((number - 1) / 10) + ((number - 1) % 10)) % 2 === 0;

    // Tile Background
    if (isGoal) {
      const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(1, '#78350f');
      ctx.fillStyle = grad;
    } else if (isPortalEntrance) {
      const grad = ctx.createRadialGradient(128, 128, 15, 128, 128, 128);
      grad.addColorStop(0, '#3b0764');
      grad.addColorStop(0.7, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
    } else if (isPortalExit) {
      const grad = ctx.createRadialGradient(128, 128, 15, 128, 128, 128);
      grad.addColorStop(0, '#701a75');
      grad.addColorStop(0.7, '#1e1b4b');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
    } else if (isSpideyTrigger) {
      ctx.fillStyle = '#0284c7';
    } else if (isGoblin) {
      const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
      grad.addColorStop(0, '#16a34a');
      grad.addColorStop(0.65, '#14532d');
      grad.addColorStop(1, '#052e16');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = isEven ? '#1e293b' : '#0f172a';
    }
    ctx.fillRect(0, 0, 256, 256);

    // Crisp high-contrast borders
    ctx.lineWidth = 8;
    if (isGoal) {
      ctx.strokeStyle = '#fef08a';
    } else if (isPortalEntrance) {
      ctx.strokeStyle = '#c084fc';
    } else if (isPortalExit) {
      ctx.strokeStyle = '#f472b6';
    } else if (isSpideyTrigger) {
      ctx.strokeStyle = '#38bdf8';
    } else if (isGoblin) {
      ctx.strokeStyle = '#22c55e';
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    }
    ctx.strokeRect(6, 6, 244, 244);

    // Inner bevel highlight
    ctx.lineWidth = 2;
    ctx.strokeStyle = isPortalEntrance ? 'rgba(192, 132, 252, 0.6)' : isPortalExit ? 'rgba(244, 114, 182, 0.6)' : isGoblin ? 'rgba(74, 222, 128, 0.5)' : 'rgba(255, 255, 255, 0.35)';
    ctx.strokeRect(13, 13, 230, 230);

    // Badges / Header labels
    if (isPortalEntrance) {
      ctx.fillStyle = '#e9d5ff';
      ctx.font = '900 18px "Outfit", -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🌀 ENTRANCE ➔ ${portalDest}`, 128, 43);

      // Swirling energy vortex rings
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.35)';
      ctx.lineWidth = 2;
      for (let r = 25; r <= 80; r += 18) {
        ctx.beginPath();
        ctx.arc(128, 140, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (isPortalExit) {
      ctx.fillStyle = '#fbcfe8';
      ctx.font = '900 18px "Outfit", -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`✨ EXIT (FROM ${portalFrom})`, 128, 43);

      // Cosmic flare radiating lines
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.35)';
      ctx.lineWidth = 2;
      for (let r = 25; r <= 80; r += 18) {
        ctx.beginPath();
        ctx.arc(128, 140, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (isSpideyTrigger) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 21px "Outfit", -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🕷️ SPIDER TRIGGER', 128, 43);

      // Web icon decorative grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.moveTo(128, 140);
        ctx.lineTo(128 + Math.cos(a) * 70, 140 + Math.sin(a) * 70);
      }
      ctx.stroke();
    } else if (isGoblin) {
      ctx.fillStyle = '#4ade80';
      ctx.font = '900 21px "Outfit", -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎃 GOBLIN HAZARD', 128, 43);
    } else if (isGoal) {
      ctx.fillStyle = '#fef08a';
      ctx.font = '900 24px "Outfit", Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.goalLabel || '🐙 TILE 100', 128, 43);
    }

    // Main Tile Number
    ctx.font = isGoal ? '900 120px "Outfit", Impact, sans-serif' : '900 100px "Outfit", -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textY = isSpideyTrigger || isGoblin || isGoal || isPortalEntrance || isPortalExit ? 150 : 128;

    // Solid black outline for razor-sharp legibility
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(`${number}`, 128, textY);

    ctx.fillStyle = isGoal ? '#ffffff' : isPortalEntrance ? '#f3e8ff' : isPortalExit ? '#fdf2f8' : isSpideyTrigger ? '#ffffff' : isGoblin ? '#ffffff' : '#f8fafc';
    ctx.fillText(`${number}`, 128, textY);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 1;
    texture.needsUpdate = true;
    return texture;
  }

  generateTiles() {
    const tileGeo = new THREE.BoxGeometry(this.tileSize, this.tileThickness, this.tileSize);
    const totalSpan = 10 * (this.tileSize + this.tileGap);
    const halfSpan = totalSpan / 2 - (this.tileSize + this.tileGap) / 2;

    this.tiles = new Array(101);

    for (let n = 1; n <= 100; n++) {
      const row = Math.floor((n - 1) / 10);
      const indexInRow = (n - 1) % 10;
      const col = row % 2 === 0 ? indexInRow : 9 - indexInRow;

      const x = col * (this.tileSize + this.tileGap) - halfSpan;
      const z = halfSpan - row * (this.tileSize + this.tileGap);
      const y = this.tileThickness / 2;

      const worldPos = new THREE.Vector3(x, y + 0.1, z);

      const topTex = this.createTileTexture(n, false, false, n === 100);
      const sideMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.75,
        metalness: 0.1
      });
      const topMat = new THREE.MeshStandardMaterial({
        map: topTex,
        roughness: 0.52,
        metalness: 0.12
      });

      const materials = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];
      const mesh = new THREE.Mesh(tileGeo, materials);
      mesh.position.set(x, y, z);
      this.boardGroup.add(mesh);
      this.tiles[n] = {
        number: n,
        row,
        col,
        position: worldPos,
        mesh,
        topMat,
        isSpideyTrigger: false,
        isGoblin: false,
        isGoal: n === 100
      };
      this.tileMeshes.push(mesh);
    }

    // Glowing halo on Tile 100
    const goalRingGeo = new THREE.RingGeometry(1.5, 1.8, 32);
    const goalRingMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide
    });
    this.goalRing = new THREE.Mesh(goalRingGeo, goalRingMat);
    this.goalRing.rotation.x = -Math.PI / 2;
    const tile100Pos = this.tiles[100].position;
    this.goalRing.position.set(tile100Pos.x, tile100Pos.y + 0.05, tile100Pos.z);
    this.boardGroup.add(this.goalRing);
  }

  setSpecialTiles(spideyTriggers, goblinPositions, portalEntrances = {}, portalExits = {}) {
    this.specialMarkers.spideyTriggers = spideyTriggers;
    this.specialMarkers.goblins = goblinPositions;
    this.specialMarkers.portalEntrances = portalEntrances;
    this.specialMarkers.portalExits = portalExits;

    for (let n = 1; n <= 100; n++) {
      const isSpidey = spideyTriggers.includes(n);
      const isGoblin = goblinPositions.includes(n);
      const isGoal = (n === this.maxTiles);
      const isPortalEntrance = Boolean(portalEntrances[n]);
      const portalDest = portalEntrances[n] || null;
      const isPortalExit = Boolean(portalExits[n]);
      const portalFrom = portalExits[n] || null;

      const tile = this.tiles[n];
      tile.isSpideyTrigger = isSpidey;
      tile.isGoblin = isGoblin;
      tile.isPortalEntrance = isPortalEntrance;
      tile.isPortalExit = isPortalExit;

      const newTex = this.createTileTexture(n, isSpidey, isGoblin, isGoal, isPortalEntrance, portalDest, isPortalExit, portalFrom);
      tile.topMat.map.dispose();
      tile.topMat.map = newTex;
      tile.topMat.needsUpdate = true;
    }
  }

  getTileWorldPosition(tileNumber) {
    const safeN = Math.max(1, Math.min(100, Math.floor(tileNumber)));
    return this.tiles[safeN].position.clone();
  }

  setGoalLabel(label) {
    this.goalLabel = label || `🐙 TILE ${this.maxTiles}`;
    const goalTile = this.tiles[this.maxTiles];
    if (goalTile && goalTile.topMat) {
      const newTex = this.createTileTexture(this.maxTiles, false, false, true, false, null, false, null);
      if (goalTile.topMat.map) goalTile.topMat.map.dispose();
      goalTile.topMat.map = newTex;
      goalTile.topMat.needsUpdate = true;
    }
  }

  update(delta) {
    if (this.goalRing) {
      this.goalRing.rotation.z += delta * 1.5;
    }
  }
}
