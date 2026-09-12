// ==========================================================================
// DEMO DIRECTOR - Interactive Showcase of All Game Elements & Mechanics
// 1. 4 MJ Multiverse Characters Lineup
// 2. 3D Serpentine Board & Special Tile Grid
// 3. 3D Physics Dice Roll & Lucky 6
// 4. Spider-Man Web Reel & Gold Spider Legs (Waldoes)
// 5. Dark Quantum Portal Warp Transit
// 6. Green Goblin Hoverboard Aerial Kidnapping
// 7. Doctor Octopus 4-Tentacle Climax Ambush
// 8. Multiverse Champion 2nd Racer Victory & Confetti
// ==========================================================================

import * as THREE from 'three';
import { CharacterFactory } from './CharacterFactory.js';
import { SpiderMan } from './SpiderMan.js';
import { GreenGoblin } from './GreenGoblin.js';
import { Portal } from './Portal.js';
import confetti from 'canvas-confetti';

export const DEMO_SCENES = [
  {
    id: 'characters',
    title: '1/8: MULTIVERSE RACERS',
    subtitle: '4 Distinct Anime MJ Variants with Auburn, Cyan, Blonde & Emerald Hair',
    duration: 6500
  },
  {
    id: 'board',
    title: '2/8: 3D SERPENTINE BOARD',
    subtitle: 'High-Visibility Grid with Spider Triggers, Goblin Hazards & Portal Rifts',
    duration: 6000
  },
  {
    id: 'dice',
    title: '3/8: 3D PHYSICS DICE ROLL',
    subtitle: 'Tumbling 3D Dice with Impact Effects, Lucky 6 Bonus & Stepping Logic',
    duration: 6500
  },
  {
    id: 'spiderman',
    title: '4/8: SPIDER-MAN WEB REEL & WALDOES',
    subtitle: '4 Gold Mechanical Legs, Realistic Web-Shooter Reel & Team-Up Hand-Holding',
    duration: 7500
  },
  {
    id: 'portal',
    title: '5/8: DARK QUANTUM PORTALS',
    subtitle: 'Swirling Wormhole Particles & Cosmic Transit to Higher Board Tiers',
    duration: 7000
  },
  {
    id: 'goblin',
    title: '6/8: GREEN GOBLIN HOVERBOARD',
    subtitle: 'Flaming Glider Thrusters, Aerial Snatch & Cinematic Rooftop Drop',
    duration: 7500
  },
  {
    id: 'dococtopus',
    title: '7/8: DOCTOR OCTOPUS AMBUSH',
    subtitle: 'Tile Climax Trap: 4 Articulated Titanium Tentacles & 3-Stage Skyline Escape',
    duration: 8000
  },
  {
    id: 'victory',
    title: '8/8: MULTIVERSE CHAMPION VICTORY',
    subtitle: '2nd Player Wins! Golden Anime Speed Lines, Fanfare & Explosive Confetti',
    duration: 7000
  }
];

export class DemoDirector {
  constructor(gameManager) {
    this.gm = gameManager;
    this.currentSceneIndex = 0;
    this.isActive = false;
    this.isPaused = false;
    this.sceneTimer = null;

    // Demo scene specific temporary entities
    this.demoEntities = [];
    this.demoCleanups = [];
    this.animFrameId = null;
  }

  startDemo() {
    this.isActive = true;
    this.isPaused = false;
    this.currentSceneIndex = 0;

    // Clear board entities from regular match
    this.clearDemoEntities();
    this.gm.players.forEach(p => this.gm.scene.remove(p.root));
    this.gm.spiderMen.forEach(s => this.gm.scene.remove(s.root));
    this.gm.greenGoblins.forEach(g => this.gm.scene.remove(g.root));
    this.gm.portals.forEach(p => p.dispose());
    if (this.gm.drOctopus) this.gm.drOctopus.reset();

    if (this.gm.hud && typeof this.gm.hud.showDemoHUD === 'function') {
      this.gm.hud.showDemoHUD(true);
    }

    this.playScene(0);
  }

  stopDemo() {
    this.isActive = false;
    this.isPaused = false;
    if (this.sceneTimer) {
      clearTimeout(this.sceneTimer);
      this.sceneTimer = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.clearDemoEntities();

    if (this.gm.hud && typeof this.gm.hud.showDemoHUD === 'function') {
      this.gm.hud.showDemoHUD(false);
    }

    // Restart regular match cleanly
    this.gm.startNewMatch(this.gm.playerCount || 2, this.gm.maxTiles || 60);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.gm.hud && typeof this.gm.hud.updateDemoPauseButton === 'function') {
      this.gm.hud.updateDemoPauseButton(this.isPaused);
    }
    if (!this.isPaused) {
      // Resume remaining time or step
      this.scheduleNextScene(3500);
    } else {
      if (this.sceneTimer) {
        clearTimeout(this.sceneTimer);
        this.sceneTimer = null;
      }
    }
  }

  nextScene() {
    if (!this.isActive) return;
    const nextIdx = (this.currentSceneIndex + 1) % DEMO_SCENES.length;
    this.playScene(nextIdx);
  }

  prevScene() {
    if (!this.isActive) return;
    const prevIdx = (this.currentSceneIndex - 1 + DEMO_SCENES.length) % DEMO_SCENES.length;
    this.playScene(prevIdx);
  }

  scheduleNextScene(duration) {
    if (this.sceneTimer) clearTimeout(this.sceneTimer);
    this.sceneTimer = setTimeout(() => {
      if (this.isActive && !this.isPaused) {
        this.nextScene();
      }
    }, duration);
  }

  clearDemoEntities() {
    this.demoCleanups.forEach(fn => {
      try { fn(); } catch (e) {}
    });
    this.demoCleanups = [];

    this.demoEntities.forEach(e => {
      if (e.root) this.gm.scene.remove(e.root);
      if (e.dispose) e.dispose();
    });
    this.demoEntities = [];
  }

  playScene(index) {
    if (this.sceneTimer) {
      clearTimeout(this.sceneTimer);
      this.sceneTimer = null;
    }
    this.clearDemoEntities();

    this.currentSceneIndex = index;
    const sceneDef = DEMO_SCENES[index];

    if (this.gm.hud && typeof this.gm.hud.updateDemoSceneInfo === 'function') {
      this.gm.hud.updateDemoSceneInfo(sceneDef);
    }

    switch (sceneDef.id) {
      case 'characters':
        this.runCharactersScene();
        break;
      case 'board':
        this.runBoardScene();
        break;
      case 'dice':
        this.runDiceScene();
        break;
      case 'spiderman':
        this.runSpiderManScene();
        break;
      case 'portal':
        this.runPortalScene();
        break;
      case 'goblin':
        this.runGoblinScene();
        break;
      case 'dococtopus':
        this.runDocOctopusScene();
        break;
      case 'victory':
        this.runVictoryScene();
        break;
      default:
        this.runCharactersScene();
        break;
    }

    if (!this.isPaused) {
      this.scheduleNextScene(sceneDef.duration);
    }
  }

  // ========================================================================
  // SCENE 1: 4 MJ MULTIVERSE CHARACTERS
  // ========================================================================
  runCharactersScene() {
    this.gm.comicFX.showBanner('MARVEL MULTIVERSE: 4 MJ RACERS');
    this.gm.audioManager.playBonusChime();

    const chars = [];
    const spacing = 2.4;
    const startX = -((4 - 1) * spacing) / 2;

    for (let i = 0; i < 4; i++) {
      const mj = CharacterFactory.createMJ(i);
      mj.root.position.set(startX + i * spacing, 0.2, 8);
      mj.root.rotation.set(0, 0, 0);
      this.gm.scene.add(mj.root);
      chars.push(mj);
      this.demoEntities.push(mj);

      // Spawn individual hair name comic tags
      setTimeout(() => {
        if (!this.isActive || this.currentSceneIndex !== 0) return;
        this.gm.comicFX.spawnAt(
          mj.root.position,
          `${mj.config.name}\n${mj.config.hairName}`,
          mj.config.hex,
          '#ffffff',
          2.5
        );
      }, 400 + i * 350);
    }

    // Smooth camera framing of the 4 characters
    const cam = this.gm.cameraDirector;
    cam.targetPosition.set(0, 4.5, 15.5);
    cam.targetLookAt.set(0, 1.4, 8);
    cam.posDamp = 4.0;
    cam.lookDamp = 4.0;

    // Idle animation loop for demo characters
    const startTime = performance.now();
    const animateChars = () => {
      if (!this.isActive || this.currentSceneIndex !== 0) return;
      const t = (performance.now() - startTime) * 0.001;
      chars.forEach((c, idx) => {
        c.animator.update(0.016);
        c.root.position.y = 0.2 + Math.sin(t * 2.5 + idx * 0.8) * 0.05;
      });
      this.animFrameId = requestAnimationFrame(animateChars);
    };
    this.animFrameId = requestAnimationFrame(animateChars);
  }

  // ========================================================================
  // SCENE 2: 3D SERPENTINE BOARD & SPECIAL MARKERS
  // ========================================================================
  runBoardScene() {
    this.gm.comicFX.showBanner('HIGH-VISIBILITY 3D SERPENTINE BOARD');
    this.gm.audioManager.playHeroicCatch();

    // Re-initialize 60 or 100 tiles board mode for demonstration
    this.gm.board.setGameMode(60);

    // Spawn sample entities so board looks completely alive
    const spidey = new SpiderMan(this.gm.scene, 1, 26, this.gm.audioManager, this.gm.comicFX, this.gm.board);
    spidey.setPosition(this.gm.board.getTileWorldPosition(26));
    spidey.setTriggerTile(12);
    this.demoEntities.push(spidey);

    const goblin = new GreenGoblin(this.gm.scene, 1, 38, this.gm.audioManager, this.gm.comicFX);
    goblin.setPosition(this.gm.board.getTileWorldPosition(38));
    this.demoEntities.push(goblin);

    const pStart = this.gm.board.getTileWorldPosition(8);
    const pDest = this.gm.board.getTileWorldPosition(22);
    const portal = new Portal(this.gm.scene, 1, 8, 22, pStart, pDest, this.gm.audioManager, this.gm.comicFX, 'dark_void');
    this.demoEntities.push(portal);

    this.gm.board.setSpecialTiles([12], [38], { 8: 22 }, { 22: 8 });

    // High sweep camera arc
    const cam = this.gm.cameraDirector;
    cam.targetPosition.set(16, 28, 26);
    cam.targetLookAt.set(0, 0, 0);
    cam.posDamp = 2.5;

    // Pan camera smoothly across the board
    const startTime = performance.now();
    const panCamera = () => {
      if (!this.isActive || this.currentSceneIndex !== 1) return;
      const t = (performance.now() - startTime) * 0.0006;
      const radius = 32;
      cam.targetPosition.set(Math.cos(t) * radius, 26, Math.sin(t) * radius);
      cam.targetLookAt.set(0, 1, 0);
      this.animFrameId = requestAnimationFrame(panCamera);
    };
    this.animFrameId = requestAnimationFrame(panCamera);
  }

  // ========================================================================
  // SCENE 3: 3D PHYSICS DICE ROLL
  // ========================================================================
  runDiceScene() {
    this.gm.comicFX.showBanner('3D DICE PHYSICS & LUCKY 6');

    const mj = CharacterFactory.createMJ(0);
    const startTile = 5;
    const startPos = this.gm.board.getTileWorldPosition(startTile);
    mj.root.position.copy(startPos);
    mj.currentTile = startTile;
    this.gm.scene.add(mj.root);
    this.demoEntities.push(mj);

    const cam = this.gm.cameraDirector;
    cam.targetPosition.set(startPos.x + 3, startPos.y + 7.5, startPos.z + 8.5);
    cam.targetLookAt.copy(startPos);

    setTimeout(() => {
      if (!this.isActive || this.currentSceneIndex !== 2) return;
      // Trigger dice roll of 6
      this.gm.dice.roll(6, startPos, () => {
        if (!this.isActive || this.currentSceneIndex !== 2) return;
        this.gm.auraManager.triggerSpeedLines(1.8, 0.85);
        this.gm.audioManager.playBonusChime();
        this.gm.comicFX.spawnAt(mj.root.position, 'LUCKY 6!\nBONUS ROLL!', '#f59e0b', '#ffffff', 2.2);

        // Step player forward 6 tiles
        const targetTile = startTile + 6;
        let cur = startTile;
        mj.animator.setState('walking');

        const stepNext = () => {
          if (!this.isActive || this.currentSceneIndex !== 2 || cur >= targetTile) {
            mj.animator.setState('idle');
            return;
          }
          cur++;
          const nextPos = this.gm.board.getTileWorldPosition(cur);
          mj.root.lookAt(nextPos.x, mj.root.position.y, nextPos.z);
          mj.root.position.copy(nextPos);
          this.gm.audioManager.playFootstep();
          setTimeout(stepNext, 250);
        };
        setTimeout(stepNext, 300);
      });
    }, 800);
  }

  // ========================================================================
  // SCENE 4: SPIDER-MAN WEB REEL & GOLD WALDOES
  // ========================================================================
  runSpiderManScene() {
    this.gm.comicFX.showBanner('🕸️ SPIDER-MAN WEB REEL & GOLD WALDOES');

    const triggerTile = 14;
    const stationTile = 28;

    const mj = CharacterFactory.createMJ(1); // Electric Cyan MJ
    const triggerPos = this.gm.board.getTileWorldPosition(triggerTile);
    mj.root.position.copy(triggerPos);
    mj.currentTile = triggerTile;
    this.gm.scene.add(mj.root);
    this.demoEntities.push(mj);

    const spidey = new SpiderMan(this.gm.scene, 1, stationTile, this.gm.audioManager, this.gm.comicFX, this.gm.board);
    const stationPos = this.gm.board.getTileWorldPosition(stationTile);
    spidey.setPosition(stationPos);
    spidey.setTriggerTile(triggerTile);
    this.demoEntities.push(spidey);

    this.gm.board.setSpecialTiles([triggerTile], [], {}, {});

    // Focus camera between them
    this.gm.cameraDirector.focusOnSpiderManAction(spidey.root.position, mj.root.position, 'start');

    setTimeout(() => {
      if (!this.isActive || this.currentSceneIndex !== 3) return;
      this.gm.auraManager.triggerSpeedLines(2.0, 0.9);
      this.gm.comicFX.spawnAt(spidey.root.position, 'THWIP!', '#38bdf8', '#ffffff', 2.0);

      spidey.triggerWebPull(mj, () => {
        if (!this.isActive || this.currentSceneIndex !== 3) return;
        this.gm.audioManager.playHeroicCatch();
        this.gm.comicFX.spawnAt(stationPos, 'TEAM-UP!', '#facc15', '#ffffff', 2.2);
        this.gm.cameraDirector.focusOnSpiderManAction(spidey.root.position, mj.root.position, 'end');
      });
    }, 1000);
  }

  // ========================================================================
  // SCENE 5: DARK QUANTUM PORTAL WARP
  // ========================================================================
  runPortalScene() {
    this.gm.comicFX.showBanner('🌀 DARK QUANTUM PORTAL WARP');

    const entranceTile = 8;
    const exitTile = 32;

    const entrancePos = this.gm.board.getTileWorldPosition(entranceTile);
    const exitPos = this.gm.board.getTileWorldPosition(exitTile);

    const mj = CharacterFactory.createMJ(2); // Golden Blonde MJ
    mj.root.position.copy(entrancePos);
    mj.currentTile = entranceTile;
    this.gm.scene.add(mj.root);
    this.demoEntities.push(mj);

    const portal = new Portal(
      this.gm.scene,
      1,
      entranceTile,
      exitTile,
      entrancePos,
      exitPos,
      this.gm.audioManager,
      this.gm.comicFX,
      'dark_crimson'
    );
    this.demoEntities.push(portal);
    this.gm.board.setSpecialTiles([], [], { [entranceTile]: exitTile }, { [exitTile]: entranceTile });

    this.gm.cameraDirector.targetPosition.set(entrancePos.x, entrancePos.y + 4.5, entrancePos.z + 7.5);
    this.gm.cameraDirector.targetLookAt.copy(entrancePos);

    setTimeout(() => {
      if (!this.isActive || this.currentSceneIndex !== 4) return;
      this.gm.auraManager.triggerSpeedLines(1.8, 0.9);

      portal.warpPlayer(
        mj,
        entranceTile,
        (startP, destP, progress) => {
          if (!this.isActive || this.currentSceneIndex !== 4) return;
          this.gm.cameraDirector.trackPortalWarp(startP, destP, progress);
        },
        (finalTile) => {
          if (!this.isActive || this.currentSceneIndex !== 4) return;
          mj.currentTile = finalTile;
          mj.root.position.copy(exitPos);
          this.gm.comicFX.spawnAt(exitPos, 'WARPED!\n+24 TILES!', '#a855f7', '#ffffff', 2.4);
          this.gm.audioManager.playBonusChime();
        }
      );
    }, 1100);
  }

  // ========================================================================
  // SCENE 6: GREEN GOBLIN HOVERBOARD AERIAL KIDNAPPING
  // ========================================================================
  runGoblinScene() {
    this.gm.comicFX.showBanner('🎃 GREEN GOBLIN AERIAL SWOOP');

    const hazardTile = 42;
    const dropTile = 16;

    const hazardPos = this.gm.board.getTileWorldPosition(hazardTile);
    const dropPos = this.gm.board.getTileWorldPosition(dropTile);

    const mj = CharacterFactory.createMJ(3); // Toxic Emerald MJ
    mj.root.position.copy(hazardPos);
    mj.currentTile = hazardTile;
    this.gm.scene.add(mj.root);
    this.demoEntities.push(mj);

    const goblin = new GreenGoblin(this.gm.scene, 1, hazardTile, this.gm.audioManager, this.gm.comicFX);
    goblin.setPosition(hazardPos);
    this.demoEntities.push(goblin);

    this.gm.board.setSpecialTiles([], [hazardTile], {}, {});

    this.gm.cameraDirector.targetPosition.set(hazardPos.x, hazardPos.y + 5.5, hazardPos.z + 9.5);
    this.gm.cameraDirector.targetLookAt.copy(hazardPos);

    setTimeout(() => {
      if (!this.isActive || this.currentSceneIndex !== 5) return;
      this.gm.auraManager.triggerSpeedLines(2.2, 0.85);

      goblin.triggerKidnapping(
        mj,
        dropPos,
        () => {
          if (!this.isActive || this.currentSceneIndex !== 5) return;
          mj.currentTile = dropTile;
          mj.root.position.copy(dropPos);
          this.gm.comicFX.spawnAt(dropPos, 'DROPPED!\n-26 TILES!', '#ef4444', '#ffffff', 2.2);
          this.gm.audioManager.playFootstep();
        },
        (curGoblinPos, destWorldPos, progress) => {
          if (!this.isActive || this.currentSceneIndex !== 5) return;
          this.gm.cameraDirector.trackFlyingGoblin(curGoblinPos, destWorldPos, progress);
        }
      );
    }, 1100);
  }

  // ========================================================================
  // SCENE 7: DOCTOR OCTOPUS CLIMAX AMBUSH
  // ========================================================================
  runDocOctopusScene() {
    this.gm.comicFX.showBanner('🐙 DOCTOR OCTOPUS TILE CLIMAX AMBUSH');
    this.gm.audioManager.playSuspenseHeartbeat();

    const goalTile = 60;
    const goalPos = this.gm.board.getTileWorldPosition(goalTile);

    const mj = CharacterFactory.createMJ(0); // MJ-1 reaches first
    mj.root.position.copy(goalPos);
    mj.currentTile = goalTile;
    this.gm.scene.add(mj.root);
    this.demoEntities.push(mj);

    this.gm.cameraDirector.focusOnTile100(goalPos);

    setTimeout(() => {
      if (!this.isActive || this.currentSceneIndex !== 6) return;
      this.gm.auraManager.triggerSpeedLines(2.0, 0.7);

      this.gm.drOctopus.triggerTrapKidnapping(
        mj,
        () => {
          if (!this.isActive || this.currentSceneIndex !== 6) return;
          this.gm.audioManager.playDefeatGong();
          this.gm.board.setGoalLabel('🏆 WIN TILE 60');
          this.gm.comicFX.showBanner('💥 MJ-1 CAPTURED! NEXT RACER TO 60 WINS!');
          this.gm.comicFX.spawnAt(goalPos, 'TRAP TRIGGERED!', '#ef4444', '#ffffff', 2.5);
        },
        (docPos, mjPos, progress) => {
          if (!this.isActive || this.currentSceneIndex !== 6) return;
          this.gm.cameraDirector.trackDocOckEscape(docPos, mjPos, progress);
        }
      );
    }, 1200);
  }

  // ========================================================================
  // SCENE 8: MULTIVERSE CHAMPION 2ND RACER VICTORY
  // ========================================================================
  runVictoryScene() {
    this.gm.comicFX.showBanner('🏆 MULTIVERSE CHAMPION: 2ND RACER WINS!');
    this.gm.audioManager.playBonusChime();

    const goalTile = 60;
    const goalPos = this.gm.board.getTileWorldPosition(goalTile);

    const winner = CharacterFactory.createMJ(1); // Electric Cyan MJ-2 wins
    winner.root.position.copy(goalPos);
    winner.currentTile = goalTile;
    this.gm.scene.add(winner.root);
    this.demoEntities.push(winner);

    this.gm.auraManager.triggerSpeedLines(2.5, 0.95);
    this.gm.cameraDirector.focusOnTile100(goalPos);

    // Confetti burst
    try {
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    this.gm.comicFX.spawnAt(goalPos, '🏆 WINNER!\nMULTIVERSE CHAMPION!', '#facc15', '#ffffff', 3.2);
    this.gm.board.setGoalLabel('🏆 WINNER TILE');

    // Victory celebration spin
    const startTime = performance.now();
    const spinWinner = () => {
      if (!this.isActive || this.currentSceneIndex !== 7) return;
      const elapsed = (performance.now() - startTime) * 0.001;
      winner.root.rotation.y = elapsed * 3.5;
      winner.root.position.y = 0.2 + Math.abs(Math.sin(elapsed * 4)) * 0.8; // jump celebration
      this.animFrameId = requestAnimationFrame(spinWinner);
    };
    this.animFrameId = requestAnimationFrame(spinWinner);
  }
}
