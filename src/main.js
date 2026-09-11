// ==========================================================================
// MAIN BOOTSTRAP - Crisp High-DPI Rendering & Smooth 60 FPS Engine
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

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );
    this.camera.position.set(0, 26, 26);

    // 3. Renderer with high DPI, filmic tone mapping & soft shadows
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Crisp DPR scaling for ultra-sharp rendering
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1.25), 2);
    this.renderer.setPixelRatio(dpr);

    // Cinematic Realistic Lighting & Color Pipeline
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);
  }

  initGame() {
    // Procedural Audio Engine
    this.audioManager = new AudioManager();

    // Comic FX Popups
    this.comicFX = new ComicFX(this.scene, this.camera);

    // Living Manhattan Penthouse Sky-Garden & Interactive Environment
    this.environment = new Environment(
      this.scene,
      this.camera,
      this.renderer.domElement,
      this.audioManager
    );

    // High-Clarity 100-Tile Board with Anisotropy
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy() || 8;
    this.board = new Board(this.scene, maxAnisotropy);

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

    this.setupNavigationGuards();
  }

  setupNavigationGuards() {
    // Prevent accidental browser back-navigation via Backspace or Alt+Left
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
      }
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
      }
    });

    // Lock history state so browser back button doesn't leave the active game session
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', () => {
      window.history.pushState(null, '', window.location.href);
    });
  }

  setupResize() {
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 1.25), 2));
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    try {
      const delta = Math.min(this.clock.getDelta(), 0.1);

      if (this.environment?.update) this.environment.update(delta);
      if (this.board?.update) this.board.update(delta);
      if (this.comicFX?.update) this.comicFX.update(delta);
      if (this.gameManager?.update) this.gameManager.update(delta);

      this.renderer.render(this.scene, this.camera);
    } catch (err) {
      console.error('Animation frame caught error:', err);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
