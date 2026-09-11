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

    this.specialMarkers = {
      spideyTriggers: [],
      goblins: []
    };

    this.createBoardPlatform();
    this.generateTiles();
    this.scene.add(this.boardGroup);
  }

  createBoardPlatform() {
    const baseWidth = (this.tileSize + this.tileGap) * 10 + 1.6;
    const baseGeo = new THREE.BoxGeometry(baseWidth, 0.8, baseWidth);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x090d16 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.4;
    baseMesh.receiveShadow = true;
    this.boardGroup.add(baseMesh);

    // Glowing cyan rim
    const rimGeo = new THREE.BoxGeometry(baseWidth + 0.3, 0.15, baseWidth + 0.3);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = 0.02;
    this.boardGroup.add(rimMesh);
  }

  // 512x512 ultra-sharp tile textures
  createTileTexture(number, isSpideyTrigger = false, isGoblin = false, isGoal = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Enable high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const isEven = (Math.floor((number - 1) / 10) + ((number - 1) % 10)) % 2 === 0;

    // Tile Background
    if (isGoal) {
      const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(1, '#78350f');
      ctx.fillStyle = grad;
    } else if (isSpideyTrigger) {
      ctx.fillStyle = '#0284c7'; // Vibrant comic sky blue
    } else if (isGoblin) {
      ctx.fillStyle = '#6b21a8'; // Menacing deep purple
    } else {
      ctx.fillStyle = isEven ? '#1e293b' : '#0f172a';
    }
    ctx.fillRect(0, 0, 512, 512);

    // Crisp high-contrast borders
    ctx.lineWidth = 16;
    if (isGoal) {
      ctx.strokeStyle = '#fef08a';
    } else if (isSpideyTrigger) {
      ctx.strokeStyle = '#38bdf8';
    } else if (isGoblin) {
      ctx.strokeStyle = '#d8b4fe';
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    }
    ctx.strokeRect(12, 12, 488, 488);

    // Inner bevel highlight
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.strokeRect(26, 26, 460, 460);

    // Badges / Header labels
    if (isSpideyTrigger) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 42px "Outfit", -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🕷️ SPIDER TRIGGER', 256, 86);

      // Web icon decorative grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.moveTo(256, 280);
        ctx.lineTo(256 + Math.cos(a) * 140, 280 + Math.sin(a) * 140);
      }
      ctx.stroke();
    } else if (isGoblin) {
      ctx.fillStyle = '#fde047';
      ctx.font = '900 42px "Outfit", -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎃 GOBLIN HAZARD', 256, 86);
    } else if (isGoal) {
      ctx.fillStyle = '#fef08a';
      ctx.font = '900 48px "Bangers", Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('❓ SECRET MULTIVERSE', 256, 86);
    }

    // Main Tile Number (Crisp, huge font)
    ctx.font = isGoal ? '900 240px "Bangers", Impact, sans-serif' : '900 200px "Outfit", -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textY = isSpideyTrigger || isGoblin || isGoal ? 300 : 256;

    // Solid black drop shadow outline for razor-sharp legibility
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(`${number}`, 256, textY);

    ctx.fillStyle = isGoal ? '#ffffff' : isSpideyTrigger ? '#ffffff' : isGoblin ? '#ffffff' : '#f8fafc';
    ctx.fillText(`${number}`, 256, textY);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = this.maxAnisotropy;
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
      mesh.receiveShadow = true;

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

  setSpecialTiles(spideyTriggers, goblinPositions) {
    this.specialMarkers.spideyTriggers = spideyTriggers;
    this.specialMarkers.goblins = goblinPositions;

    for (let n = 1; n <= 100; n++) {
      const isSpidey = spideyTriggers.includes(n);
      const isGoblin = goblinPositions.includes(n);
      const isGoal = n === 100;

      const tile = this.tiles[n];
      tile.isSpideyTrigger = isSpidey;
      tile.isGoblin = isGoblin;

      const newTex = this.createTileTexture(n, isSpidey, isGoblin, isGoal);
      tile.topMat.map.dispose();
      tile.topMat.map = newTex;
      tile.topMat.needsUpdate = true;
    }
  }

  getTileWorldPosition(tileNumber) {
    const safeN = Math.max(1, Math.min(100, Math.floor(tileNumber)));
    return this.tiles[safeN].position.clone();
  }

  update(delta) {
    if (this.goalRing) {
      this.goalRing.rotation.z += delta * 1.5;
    }
  }
}
