// ==========================================================================
// BOARD - High-Visibility 100-Tile Serpentine Grid (Peak 2.5D Clarity)
// ==========================================================================

import * as THREE from 'three';

export class Board {
  constructor(scene) {
    this.scene = scene;
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
    this.boardGroup.add(baseMesh);

    // Cyan glowing rim
    const rimGeo = new THREE.BoxGeometry(baseWidth + 0.3, 0.15, baseWidth + 0.3);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = 0.02;
    this.boardGroup.add(rimMesh);
  }

  createTileTexture(number, isSpideyTrigger = false, isGoblin = false, isGoal = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const isEven = (Math.floor((number - 1) / 10) + ((number - 1) % 10)) % 2 === 0;

    if (isGoal) {
      ctx.fillStyle = '#b45309'; // Gold
    } else if (isSpideyTrigger) {
      ctx.fillStyle = '#0369a1'; // Deep Spidey Sky Blue
    } else if (isGoblin) {
      ctx.fillStyle = '#581c87'; // Sinister Goblin Purple
    } else {
      ctx.fillStyle = isEven ? '#1e293b' : '#0f172a';
    }
    ctx.fillRect(0, 0, 256, 256);

    // High-contrast border
    ctx.lineWidth = 8;
    if (isGoal) {
      ctx.strokeStyle = '#fef08a';
    } else if (isSpideyTrigger) {
      ctx.strokeStyle = '#38bdf8';
    } else if (isGoblin) {
      ctx.strokeStyle = '#c084fc';
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    }
    ctx.strokeRect(6, 6, 244, 244);

    // Prominent labels for triggers
    if (isSpideyTrigger) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 24px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🕷️ SPIDER TRIGGER', 128, 42);
    } else if (isGoblin) {
      ctx.fillStyle = '#fde047';
      ctx.font = '900 24px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎃 GOBLIN HAZARD', 128, 42);
    } else if (isGoal) {
      ctx.fillStyle = '#fef08a';
      ctx.font = '900 24px "Bangers", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('❓ SECRET 100', 128, 42);
    }

    // Huge clear high-contrast numeral in center
    ctx.font = isGoal ? '900 120px "Bangers", Impact, sans-serif' : '900 100px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Black drop shadow outline
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(`${number}`, 128, isSpideyTrigger || isGoblin || isGoal ? 142 : 128);

    ctx.fillStyle = isGoal ? '#ffffff' : isSpideyTrigger ? '#ffffff' : isGoblin ? '#ffffff' : '#f8fafc';
    ctx.fillText(`${number}`, 128, isSpideyTrigger || isGoblin || isGoal ? 142 : 128);

    const texture = new THREE.CanvasTexture(canvas);
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
      const sideMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const topMat = new THREE.MeshBasicMaterial({ map: topTex });

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
    const goalRingGeo = new THREE.RingGeometry(1.5, 1.8, 24);
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
