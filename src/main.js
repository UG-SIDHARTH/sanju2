// ==========================================================================
// MAIN BOOTSTRAP - Optimized for Intel Pentium, 4GB DDR3 & Integrated Graphics
// Locked 60 FPS, High-Visibility 2.5D Comic Presentation
// ==========================================================================

import * as THREE from 'three';
import { Environment } from './game/Environment.js';
import { Board } from './game/Board.js';
import { AudioManager } from './game/AudioManager.js';
import { ComicFX } from './game/ComicFX.js';
import { GameManager } from './game/GameManager.js';
import { HUD } from './ui/HUD.js';

class App {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();

    this.initThree();
    this.initGame();
    this.setupResize();
    this.animate();
  }

  initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera (Clear, crisp perspective for 2.5D view)
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );
    this.camera.position.set(0, 26, 26);

    // 3. Renderer - Max performance for Intel Pentium (pixel ratio clamped to 1.0, shadows off)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(1.0); // Clamped for Intel Pentium GPU fill-rate efficiency
    this.renderer.shadowMap.enabled = false; // Disabled for maximum FPS on integrated graphics

    this.container.appendChild(this.renderer.domElement);
  }

  initGame() {
    // Procedural Audio Engine (zero network/disk asset stalls)
    this.audioManager = new AudioManager();

    // Comic FX Popups
    this.comicFX = new ComicFX(this.scene, this.camera);

    // Fast Comic Rooftop Backdrop
    this.environment = new Environment(this.scene);

    // High-Clarity 100-Tile Board
    this.board = new Board(this.scene);

    // Game Manager with 5 Classic Spider-Men & 6 Green Goblins
    this.gameManager = new GameManager(
      this.scene,
      this.camera,
      this.renderer,
      this.audioManager,
      this.comicFX
    );
    this.gameManager.setBoard(this.board);

    // HUD UI Manager
    this.hud = new HUD(this.gameManager);
    this.gameManager.setHUD(this.hud);
  }

  setupResize() {
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (this.board) this.board.update(delta);
    if (this.comicFX) this.comicFX.update(delta);
    if (this.gameManager) this.gameManager.update(delta);

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
