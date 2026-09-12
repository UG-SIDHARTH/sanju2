// ==========================================================================
// GAME MANAGER - 2-Player Single-Device 3D Anime Game
// 6 Spider-Men (Gold Legs), 3 Green Goblins (Hoverboards), 4 Portals, Exact 100
// ==========================================================================

import * as THREE from 'three';
import { CameraDirector } from './CameraDirector.js';
import { CharacterFactory } from './CharacterFactory.js';
import { SpiderMan } from './SpiderMan.js';
import { GreenGoblin } from './GreenGoblin.js';
import { Dice3D } from './Dice3D.js';
import { DrOctopus } from './DrOctopus.js';
import { Portal } from './Portal.js';
import { AuraManager } from './AuraManager.js';
import { DemoDirector } from './DemoDirector.js';

export class GameManager {
  constructor(scene, camera, renderer, audioManager, comicFX) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.audioManager = audioManager;
    this.comicFX = comicFX;

    this.board = null;
    this.cameraDirector = new CameraDirector(camera, renderer.domElement);
    this.cameraDirector.setGameManager(this);
    this.dice = new Dice3D(scene, audioManager);
    this.hud = null;

    // Flowing Anime Aura & Speed Lines
    this.auraManager = new AuraManager(scene, camera);

    // Tile 100 Trap Boss: Doctor Octopus
    this.drOctopus = new DrOctopus(scene, audioManager, comicFX);

    // Cinematic Demo Showcase Director
    this.demoDirector = new DemoDirector(this);

    // Game state (2P, 3P, 4P Single Device Pass & Play)
    this.players = [];
    this.activePlayerIndex = 0;
    this.isTurnProcessing = false;
    this.bonusRollEarned = false;
    this.playerCount = 2;
    this.firstPlayerCaptured = false;
    this.capturedPlayer = null;
    this.maxTiles = 100;

    // Entities: Exactly 6 Spider-Men, 3 Green Goblins & 6 Portals (3 Pairs)
    this.spiderMen = [];
    this.greenGoblins = [];
    this.portals = [];

    this.spideyConfig = [];
    this.goblinConfig = [];
    this.portalConfigs = [];
    this.portalEntrances = {};
    this.portalExits = {};
    this.goblinDropMap = {};

    this.activeMovement = null;
    this.isTurbo = false;
  }

  startDemoMode() {
    this.demoDirector.startDemo();
  }

  stopDemoMode() {
    this.demoDirector.stopDemo();
  }

  setTurboMode(isTurbo) {
    this.isTurbo = isTurbo;
    if (this.activeMovement) {
      this.activeMovement.stepDuration = this.isTurbo ? 0.20 : 0.38;
    }
  }

  setBoard(board) {
    this.board = board;
  }

  setHUD(hud) {
    this.hud = hud;
  }

  // Multi-source cryptographically secure, unpredictable random integer
  getRandomInt(min, max) {
    const range = max - min + 1;
    const cryptoObj = (typeof window !== 'undefined' && window.crypto) || (typeof crypto !== 'undefined' ? crypto : null);
    if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
      try {
        const maxValid = Math.floor(0xFFFFFFFF / range) * range;
        const buf = new Uint32Array(4);
        let val;
        do {
          cryptoObj.getRandomValues(buf);
          const microTime = (Math.floor(performance.now() * 1000000) ^ Date.now()) >>> 0;
          val = (buf[0] ^ (buf[1] << 7) ^ (buf[2] >>> 3) ^ (buf[3] << 13) ^ microTime) >>> 0;
        } while (val >= maxValid);
        return min + (val % range);
      } catch (e) {}
    }
    return min + Math.floor(Math.random() * range);
  }

  // --- PROCEDURAL GENERATOR: SCALED FOR 60 TILES (QUICK) OR 100 TILES (CLASSIC) ---
  generateRandomBoardLayout() {
    const usedTiles = new Set([1, this.maxTiles]);

    // Helper: pick random unused tile in [min, max]
    const pickTile = (min, max) => {
      let attempts = 0;
      while (attempts < 200) {
        const t = this.getRandomInt(min, max);
        if (!usedTiles.has(t)) {
          usedTiles.add(t);
          return t;
        }
        attempts++;
      }
      return min;
    };

    if (this.maxTiles === 60) {
      // 60-Tile Quick Mode: 4 Spider-Men, 2 Goblins, 2 Portals (all <= 57)
      const spideyTiers = [
        { triggerMin: 3, triggerMax: 10, stationMin: 16, stationMax: 24 },
        { triggerMin: 12, triggerMax: 20, stationMin: 26, stationMax: 36 },
        { triggerMin: 22, triggerMax: 34, stationMin: 40, stationMax: 48 },
        { triggerMin: 36, triggerMax: 46, stationMin: 50, stationMax: 57 }
      ];

      this.spideyConfig = spideyTiers.map((tier, idx) => {
        const trigger = pickTile(tier.triggerMin, tier.triggerMax);
        const station = pickTile(Math.max(trigger + 6, tier.stationMin), tier.stationMax);
        return { id: idx + 1, trigger, station };
      });

      const goblinTiers = [
        { stationMin: 26, stationMax: 38, dropMin: 8, dropMax: 18 },
        { stationMin: 44, stationMax: 57, dropMin: 22, dropMax: 36 }
      ];

      this.goblinDropMap = {};
      this.goblinConfig = goblinTiers.map((tier, idx) => {
        const station = pickTile(tier.stationMin, tier.stationMax);
        const drop = pickTile(tier.dropMin, Math.min(station - 8, tier.dropMax));
        this.goblinDropMap[station] = drop;
        return { id: idx + 1, station, drop };
      });

      this.portalEntrances = {};
      this.portalExits = {};
      const portalTiers = [
        { startMin: 5, startMax: 15, destMin: 20, destMax: 32, theme: 'dark_void' },
        { startMin: 22, startMax: 35, destMin: 40, destMax: 56, theme: 'dark_crimson' }
      ];

      this.portalConfigs = portalTiers.map((tier, idx) => {
        const start = pickTile(tier.startMin, tier.startMax);
        const dest = pickTile(Math.max(start + 8, tier.destMin), tier.destMax);
        this.portalEntrances[start] = dest;
        this.portalExits[dest] = start;
        return { id: idx + 1, start, dest, theme: tier.theme };
      });
      return;
    }

    // 100-Tile Classic Mode: 6 Spider-Men, 3 Goblins, 3 Portals
    const spideyTiers = [
      { triggerMin: 3, triggerMax: 15, stationMin: 22, stationMax: 34 },
      { triggerMin: 18, triggerMax: 30, stationMin: 38, stationMax: 50 },
      { triggerMin: 32, triggerMax: 44, stationMin: 52, stationMax: 65 },
      { triggerMin: 48, triggerMax: 60, stationMin: 68, stationMax: 78 },
      { triggerMin: 62, triggerMax: 74, stationMin: 80, stationMax: 89 },
      { triggerMin: 72, triggerMax: 84, stationMin: 91, stationMax: 97 }
    ];

    this.spideyConfig = spideyTiers.map((tier, idx) => {
      const trigger = pickTile(tier.triggerMin, tier.triggerMax);
      const station = pickTile(Math.max(trigger + 8, tier.stationMin), tier.stationMax);
      return { id: idx + 1, trigger, station };
    });

    // 2. Generate 3 Green Goblin hazards (station > drop)
    const goblinTiers = [
      { stationMin: 35, stationMax: 52, dropMin: 14, dropMax: 28 },
      { stationMin: 64, stationMax: 79, dropMin: 36, dropMax: 56 },
      { stationMin: 86, stationMax: 96, dropMin: 60, dropMax: 80 }
    ];

    this.goblinDropMap = {};
    this.goblinConfig = goblinTiers.map((tier, idx) => {
      const station = pickTile(tier.stationMin, tier.stationMax);
      const drop = pickTile(tier.dropMin, Math.min(station - 10, tier.dropMax));
      this.goblinDropMap[station] = drop;
      return { id: idx + 1, station, drop };
    });

    // 3. Exactly 6 Portals (3 connected pairs: 3 Entrance -> 3 Exit; always higher, never downward)
    this.portalEntrances = {};
    this.portalExits = {};
    const portalTiers = [
      { startMin: 8, startMax: 24, destMin: 34, destMax: 50, theme: 'dark_void' },
      { startMin: 28, startMax: 48, destMin: 56, destMax: 76, theme: 'dark_crimson' },
      { startMin: 52, startMax: 70, destMin: 78, destMax: 94, theme: 'dark_abyss' }
    ];

    this.portalConfigs = portalTiers.map((tier, idx) => {
      const start = pickTile(tier.startMin, tier.startMax);
      const dest = pickTile(Math.max(start + 12, tier.destMin), tier.destMax);
      this.portalEntrances[start] = dest;
      this.portalExits[dest] = start;
      return { id: idx + 1, start, dest, theme: tier.theme };
    });
  }

  // --- START NEW MATCH (2, 3, or 4 Players; 60 or 100 Tiles) ---
  startNewMatch(playerCount = 2, maxTiles = 100) {
    // If demo mode is active or lingering, cleanly stop it
    if (this.demoDirector && this.demoDirector.isActive) {
      this.demoDirector.stopDemo();
      return;
    }
    if (this.hud && typeof this.hud.showDemoHUD === 'function') {
      this.hud.showDemoHUD(false);
    }

    this.playerCount = Math.min(4, Math.max(2, playerCount));
    this.maxTiles = maxTiles === 60 ? 60 : 100;
    this.firstPlayerCaptured = false;
    this.capturedPlayer = null;

    // Clear old entities
    this.players.forEach(p => this.scene.remove(p.root));
    this.players = [];

    this.spiderMen.forEach(s => this.scene.remove(s.root));
    this.spiderMen = [];

    this.greenGoblins.forEach(g => this.scene.remove(g.root));
    this.greenGoblins = [];

    this.portals.forEach(p => p.dispose());
    this.portals = [];

    if (this.drOctopus) {
      this.drOctopus.reset();
    }

    if (this.board) {
      this.board.setGameMode(this.maxTiles);
      this.board.setGoalLabel(`🐙 TILE ${this.maxTiles}`);
    }

    // Spawn MJs for selected player count (2, 3, or 4)
    for (let i = 0; i < this.playerCount; i++) {
      const char = CharacterFactory.createMJ(i);
      char.currentTile = 1;
      char.isEliminated = false;
      this.scene.add(char.root);
      this.players.push(char);
    }

    // Generate fresh, completely randomized board for every match
    this.generateRandomBoardLayout();
    this.spawnEntitiesFromConfig();

    this.updatePlayerPositionsOnTile(1);

    this.activePlayerIndex = 0;
    this.isTurnProcessing = false;
    this.bonusRollEarned = false;

    this.hud.renderPlayersList(this.players, this.activePlayerIndex);
    this.hud.updateTurnDisplay(this.getActivePlayer(), false);
    this.hud.setRollButtonEnabled(true);

    const modeName = this.maxTiles === 60 ? 'Quick (60 Tiles)' : 'Classic (100 Tiles)';
    this.hud.logEvent(`Match started (${this.playerCount}P, ${modeName})! Entities randomized.`);
    this.cameraDirector.focusOnBoard();
  }

  spawnEntitiesFromConfig() {
    // 1. Spawn 6 Spider-Men (with gold spider legs on their backs)
    this.spiderMen = [];
    this.spideyConfig.forEach(cfg => {
      const spidey = new SpiderMan(this.scene, cfg.id, cfg.station, this.audioManager, this.comicFX, this.board);
      const pos = this.board.getTileWorldPosition(cfg.station);
      spidey.setPosition(pos);
      spidey.setTriggerTile(cfg.trigger);
      this.spiderMen.push(spidey);
    });

    // 2. Spawn 3 Green Goblins (standing on flying hoverboards)
    this.greenGoblins = [];
    this.goblinConfig.forEach(cfg => {
      const goblin = new GreenGoblin(this.scene, cfg.id, cfg.station, this.audioManager, this.comicFX);
      const pos = this.board.getTileWorldPosition(cfg.station);
      goblin.setPosition(pos);
      this.greenGoblins.push(goblin);
    });

    // 3. Spawn 4 Portals (2 Connected Entrance/Exit Pairs)
    this.portals = [];
    this.portalConfigs.forEach(cfg => {
      const startPos = this.board.getTileWorldPosition(cfg.start);
      const destPos = this.board.getTileWorldPosition(cfg.dest);
      const portal = new Portal(
        this.scene,
        cfg.id,
        cfg.start,
        cfg.dest,
        startPos,
        destPos,
        this.audioManager,
        this.comicFX,
        cfg.theme || 'dark_void'
      );
      this.portals.push(portal);
    });

    // Refresh 100-Tile board visuals with exact markers (Zero snakes, zero ladders!)
    const spideyTriggers = this.spideyConfig.map(s => s.trigger);
    const goblinHazardTiles = this.goblinConfig.map(g => g.station);
    this.board.setSpecialTiles(spideyTriggers, goblinHazardTiles, this.portalEntrances, this.portalExits);
  }

  getActivePlayer() {
    return this.players[this.activePlayerIndex];
  }

  // 2-Player Local Dice Roll Trigger
  handleRollDice() {
    if (this.isTurnProcessing || this.demoDirector?.isActive) return;
    const activePlayer = this.getActivePlayer();
    if (!activePlayer || activePlayer.isEliminated) return;

    this.isTurnProcessing = true;
    this.hud.setRollButtonEnabled(false);

    const diceRoll = this.getRandomInt(1, 6);
    this.executeDiceRoll(diceRoll, activePlayer);
  }

  // --- DICE ROLL EXECUTION & EXACT 100 WIN RULE ---
  executeDiceRoll(diceRoll, activePlayer) {
    this.hud.logEvent(`${activePlayer.config.name} rolling 3D dice...`);

    this.dice.roll(diceRoll, activePlayer.root.position, () => {
      this.hud.logEvent(`${activePlayer.config.name} rolled a ${diceRoll}!`, true);

      const startTile = activePlayer.currentTile;
      const neededToReachGoal = this.maxTiles - startTile;

      // --- EXACT GOAL RULE (TILE 60 OR 100) ---
      // If roll > needed, the player CANNOT move!
      if (startTile + diceRoll > this.maxTiles) {
        this.comicFX.spawnAt(
          activePlayer.root.position,
          `NEED EXACT ${neededToReachGoal}!`,
          '#ef4444',
          '#ffffff',
          2.0
        );
        this.audioManager.playFootstep();
        this.hud.logEvent(
          `🚫 Over-rolled! ${activePlayer.config.name} needs an exact ${neededToReachGoal} to reach Tile ${this.maxTiles}!`,
          true
        );

        // Check if rolled 6: still gets bonus roll even if blocked!
        const getsBonus = (diceRoll === 6);
        if (getsBonus) {
          this.comicFX.spawnAt(activePlayer.root.position, 'LUCKY 6!', '#f59e0b', '#ffffff', 1.8);
          this.audioManager.playBonusChime();
          this.hud.logEvent(`⚡ BONUS ROLL EARNED FOR ROLLING 6!`, true);
        }

        setTimeout(() => {
          this.finishTurn(getsBonus);
        }, 1200);
        return;
      }

      // Valid exact roll or forward progress!
      const actualSteps = diceRoll;
      let getsBonusFromSix = false;
      if (diceRoll === 6 && (startTile + actualSteps) < this.maxTiles) {
        getsBonusFromSix = true;
        this.comicFX.spawnAt(activePlayer.root.position, 'LUCKY 6!', '#f59e0b', '#ffffff', 1.8);
        this.audioManager.playBonusChime();
        this.hud.logEvent(`${activePlayer.config.name} rolled a 6! BONUS TURN!`, true);
      }

      this.startPlayerMovement(activePlayer, actualSteps, getsBonusFromSix);
    });
  }

  startPlayerMovement(player, steps, getsBonusFromSix) {
    // Release hand-holding cleanly before stepping
    this.spiderMen.forEach(s => {
      if (s.partnerMJ === player) {
        s.releaseHands();
      }
    });

    const startTile = player.currentTile;
    const targetTile = startTile + steps;
    const path = [];

    for (let t = startTile + 1; t <= targetTile; t++) {
      path.push(t);
    }

    if (path.length === 0) {
      this.finishTurn(getsBonusFromSix);
      return;
    }

    player.animator.setState('walking');

    const firstTile = path[0];
    const fromPos = player.root.position.clone();
    const toPos = this.board.getTileWorldPosition(firstTile);
    player.root.lookAt(toPos.x, player.root.position.y, toPos.z);
    this.audioManager.playFootstep();

    const baseDuration = this.isTurbo ? 0.20 : 0.38;

    this.activeMovement = {
      player,
      path,
      pathIndex: 0,
      stepElapsed: 0,
      stepDuration: baseDuration,
      fromPos,
      toPos,
      targetTile,
      getsBonusFromSix
    };
  }

  updateMovement(delta) {
    if (!this.activeMovement) return;

    const m = this.activeMovement;
    m.stepElapsed += delta;
    const rawProgress = Math.min(1.0, m.stepElapsed / m.stepDuration);

    const ease = rawProgress * rawProgress * (3 - 2 * rawProgress);
    m.player.root.position.lerpVectors(m.fromPos, m.toPos, ease);
    m.player.root.lookAt(m.toPos.x, m.player.root.position.y, m.toPos.z);

    this.cameraDirector.focusOnPlayer(m.player.root.position);

    if (rawProgress >= 1.0) {
      m.player.root.position.copy(m.toPos);
      const currentTileNum = m.path[m.pathIndex];
      m.player.currentTile = currentTileNum;

      this.hud.updateTurnDisplay(m.player, this.bonusRollEarned || m.getsBonusFromSix);
      this.hud.renderPlayersList(this.players, this.activePlayerIndex);

      m.pathIndex++;

      if (m.pathIndex < m.path.length) {
        const nextTileNum = m.path[m.pathIndex];
        m.fromPos.copy(m.toPos);
        m.toPos = this.board.getTileWorldPosition(nextTileNum);
        m.stepElapsed = 0;
        m.player.root.lookAt(m.toPos.x, m.player.root.position.y, m.toPos.z);
        this.audioManager.playFootstep();
      } else {
        const targetTile = m.targetTile;
        const getsBonusFromSix = m.getsBonusFromSix;
        const player = m.player;
        this.activeMovement = null;

        player.animator.setState('idle');
        this.updatePlayerPositionsOnTile(targetTile);
        this.hud.renderPlayersList(this.players, this.activePlayerIndex);
        this.hud.updateTurnDisplay(player, this.bonusRollEarned || getsBonusFromSix);

        this.checkTileEvents(player, targetTile, getsBonusFromSix);
      }
    }
  }

  checkTileEvents(player, landedTile, hadBonusRoll) {
    let bonusRoll = hadBonusRoll;

    // 1. EXACT GOAL REACHED (TILE 60 OR 100): TRIGGER EPIC CLIMAX!
    if (landedTile === this.maxTiles) {
      this.handleSecret100Reached(player);
      return;
    }

    // 2. Spider-Man Web Pull Trigger (Automatic Cinematic Close-Up)
    const triggeredSpidey = this.spiderMen.find(s => s.triggerTileNumber === landedTile);
    if (triggeredSpidey) {
      this.hud.logEvent(`🕸️ SPIDER-MAN #${triggeredSpidey.id} TRIGGERED on Tile ${landedTile}! Reeling in ${player.config.name}!`, true);

      // Automatic dramatic cinematic close-up with anime speed lines!
      this.auraManager.triggerSpeedLines(1.8, 0.9);
      this.cameraDirector.focusOnSpiderManAction(triggeredSpidey.root.position, player.root.position, 'start');

      triggeredSpidey.triggerWebPull(player, () => {
        player.currentTile = triggeredSpidey.fixedTileNumber;
        this.updatePlayerPositionsOnTile(player.currentTile);
        this.hud.renderPlayersList(this.players, this.activePlayerIndex);
        this.hud.updateTurnDisplay(player, bonusRoll);
        this.hud.logEvent(`${player.config.name} webbed to Tile ${player.currentTile}!`);

        // Close-up framing of Spider-Man and MJ team-up
        this.cameraDirector.focusOnSpiderManAction(triggeredSpidey.root.position, player.root.position, 'end');

        setTimeout(() => {
          this.checkCollisionAndFinish(player, bonusRoll);
        }, 600);
      });
      return;
    }

    // 2.5 Spider-Man Station Tile: Spider-Man and MJ hold hands
    const stationedSpidey = this.spiderMen.find(s => s.fixedTileNumber === landedTile);
    if (stationedSpidey) {
      this.audioManager.playHeroicCatch();
      stationedSpidey.holdHands(player);
    }

    // 2.75 Dark Void Portal Warp (Entrance Portals Only - Always Higher!)
    const triggeredPortal = this.portals.find(p => p.isEntranceTile(landedTile));
    if (triggeredPortal) {
      const destTile = triggeredPortal.getDestination(landedTile);
      this.hud.logEvent(`🌀 DARK QUANTUM PORTAL ENTRANCE on Tile ${landedTile}! Warping ${player.config.name} to Higher Tile ${destTile}!`, true);

      this.auraManager.triggerSpeedLines(1.6, 0.85);
      triggeredPortal.warpPlayer(
        player,
        landedTile,
        (startP, destP, progress) => {
          this.cameraDirector.trackPortalWarp(startP, destP, progress);
        },
        (finalDestTile) => {
          player.currentTile = finalDestTile;
          this.updatePlayerPositionsOnTile(player.currentTile);
          this.hud.renderPlayersList(this.players, this.activePlayerIndex);
          this.hud.updateTurnDisplay(player, bonusRoll);
          this.hud.logEvent(`✨ ${player.config.name} emerged through the cosmic exit rift onto Higher Tile ${player.currentTile}!`);

          this.checkCollisionAndFinish(player, bonusRoll);
        }
      );
      return;
    }

    // 3. Green Goblin Hazard (Automatic Cinematic Close-Up)
    const triggeredGoblin = this.greenGoblins.find(g => g.fixedTileNumber === landedTile);
    if (triggeredGoblin) {
      const dropTile = this.goblinDropMap[landedTile] || Math.max(2, landedTile - 15);
      const dropPos = this.board.getTileWorldPosition(dropTile);

      this.hud.logEvent(`🎃 GREEN GOBLIN #${triggeredGoblin.id} ON TILE ${landedTile}! Swooping ${player.config.name} to Tile ${dropTile}!`, true);

      // Automatic cinematic close-up with speed lines!
      this.auraManager.triggerSpeedLines(2.2, 0.85);

      triggeredGoblin.triggerKidnapping(
        player,
        dropPos,
        () => {
          player.currentTile = dropTile;
          this.updatePlayerPositionsOnTile(dropTile);
          this.hud.renderPlayersList(this.players, this.activePlayerIndex);
          this.hud.updateTurnDisplay(player, bonusRoll);
          this.hud.logEvent(`${player.config.name} is now on Tile ${dropTile}!`);

          this.checkCollisionAndFinish(player, bonusRoll);
        },
        (curGoblinPos, destWorldPos, progress) => {
          this.cameraDirector.trackFlyingGoblin(curGoblinPos, destWorldPos, progress);
        }
      );
      return;
    }

    // 4. Player Collision
    this.checkCollisionAndFinish(player, bonusRoll);
  }

  checkCollisionAndFinish(player, hadBonusRoll) {
    let bonus = hadBonusRoll;
    const otherPlayersOnTile = this.players.filter(
      p => p !== player && !p.isEliminated && p.currentTile === player.currentTile
    );

    if (otherPlayersOnTile.length > 0) {
      bonus = true;
      this.comicFX.spawnAt(player.root.position, 'COLLISION!', '#3b82f6', '#ffffff', 1.8);
      this.audioManager.playBonusChime();
      this.hud.logEvent(`💥 COLLISION! ${player.config.name} bumped ${otherPlayersOnTile[0].config.name}! BONUS ROLL!`, true);
    }

    this.finishTurn(bonus);
  }

  // --- GOAL ENDGAME: 1ST CAPTURED BY DOC OCK, 2ND WINS ---
  handleSecret100Reached(player) {
    this.audioManager.playSuspenseHeartbeat();
    const goalPos = this.board.getTileWorldPosition(this.maxTiles);
    this.cameraDirector.focusOnTile100(goalPos);
    this.hud.logEvent(`⚡ ${player.config.name} REACHED TILE ${this.maxTiles}!`, true);

    // CASE 1: 1st Player reaches Goal Tile -> DOCTOR OCTOPUS AMBUSH & CAPTURE!
    if (!this.firstPlayerCaptured) {
      this.auraManager.triggerSpeedLines(1.8, 0.6);

      setTimeout(() => {
        this.drOctopus.triggerTrapKidnapping(
          player,
          () => {
            this.audioManager.playDefeatGong();

            player.isEliminated = true;
            player.root.visible = false;
            this.firstPlayerCaptured = true;
            this.capturedPlayer = player;

            // Update physical board goal label to golden WINNER tile
            this.board.setGoalLabel(`🏆 WIN TILE ${this.maxTiles}`);

            const remainingActive = this.players.filter(p => !p.isEliminated);
            this.hud.renderPlayersList(this.players, this.activePlayerIndex);

            if (remainingActive.length > 0) {
              this.comicFX.showBanner(`💥 ${player.config.name} CAPTURED! NEXT TO REACH ${this.maxTiles} WINS!`);
              this.hud.logEvent(`💀 ${player.config.name} was CAPTURED by Doc Ock! The NEXT player to reach ${this.maxTiles} WINS!`, true);

              this.hud.showTrapAmbushedNotice(player, remainingActive, () => {
                this.cameraDirector.focusOnBoard();
                this.advanceToNextPlayer();
              });
            } else {
              this.isTurnProcessing = false;
              this.hud.showTrapDefeat(player);
              this.hud.logEvent(`💀 YOU LOSE! ${player.config.name} fell right into the trap!`, true);
            }
          },
          (docPos, mjPos, progress) => {
            this.cameraDirector.trackDocOckEscape(docPos, mjPos, progress);
          }
        );
      }, 1000);
      return;
    }

    // CASE 2: 2nd Player (or next player) reaches Goal Tile -> WINS THE GAME!
    this.isTurnProcessing = false;
    this.auraManager.triggerSpeedLines(2.4, 0.95);
    this.audioManager.playBonusChime();
    this.comicFX.spawnAt(player.root.position, 'WINNER!', '#facc15', '#ffffff', 3.0);
    this.comicFX.showBanner(`🏆 ${player.config.name} REACHED TILE ${this.maxTiles} AND WINS!`);

    setTimeout(() => {
      this.hud.showVictory(player, this.capturedPlayer);
      this.hud.logEvent(`🏆 MULTIVERSE CHAMPION! ${player.config.name} conquered Tile ${this.maxTiles} and WON!`, true);
    }, 600);
  }

  updatePlayerPositionsOnTile(tileNumber) {
    const playersOnTile = this.players.filter(p => !p.isEliminated && p.currentTile === tileNumber);
    const baseTilePos = this.board.getTileWorldPosition(tileNumber);
    const spideyOnTile = this.spiderMen.find(s => s.fixedTileNumber === tileNumber);

    if (spideyOnTile) {
      if (playersOnTile.length > 0) {
        const partnerPlayer = playersOnTile[0];
        spideyOnTile.holdHands(partnerPlayer);

        if (playersOnTile.length > 1) {
          const others = playersOnTile.slice(1);
          others.forEach((p, idx) => {
            const angle = (idx / others.length) * Math.PI + Math.PI / 2;
            const offsetX = Math.cos(angle) * 0.95;
            const offsetZ = Math.sin(angle) * 0.95;
            p.root.position.set(baseTilePos.x + offsetX, 0.1, baseTilePos.z + offsetZ);
            p.root.lookAt(baseTilePos.x, 0.1, baseTilePos.z);
          });
        }
      } else {
        if (spideyOnTile.isHoldingHands) {
          spideyOnTile.releaseHands();
        }
      }
      return;
    }

    const nextTile = Math.min(this.maxTiles, tileNumber + 1);
    const nextTilePos = this.board.getTileWorldPosition(nextTile);

    if (playersOnTile.length === 1) {
      playersOnTile[0].root.position.set(baseTilePos.x, 0.1, baseTilePos.z);
      if (tileNumber < this.maxTiles) {
        playersOnTile[0].root.lookAt(nextTilePos.x, 0.1, nextTilePos.z);
      }
    } else if (playersOnTile.length > 1) {
      const radius = 0.65;
      playersOnTile.forEach((p, idx) => {
        const angle = (idx / playersOnTile.length) * Math.PI * 2;
        const offsetX = Math.cos(angle) * radius;
        const offsetZ = Math.sin(angle) * radius;
        p.root.position.set(baseTilePos.x + offsetX, 0.1, baseTilePos.z + offsetZ);
        if (tileNumber < this.maxTiles) {
          p.root.lookAt(nextTilePos.x, 0.1, nextTilePos.z);
        }
      });
    }
  }

  finishTurn(hasBonusRoll) {
    const activePlayer = this.getActivePlayer();

    if (hasBonusRoll && !activePlayer.isEliminated) {
      this.isTurnProcessing = false;
      this.bonusRollEarned = true;
      this.hud.updateTurnDisplay(activePlayer, true);
      this.hud.setRollButtonEnabled(true);
      this.hud.logEvent(`⚡ ${activePlayer.config.name} has a BONUS ROLL ready!`);
    } else {
      this.advanceToNextPlayer();
    }
  }

  advanceToNextPlayer() {
    this.bonusRollEarned = false;

    // Advance to next active (non-eliminated) player
    let nextIndex = this.activePlayerIndex;
    let found = false;
    for (let i = 1; i <= this.players.length; i++) {
      const idx = (this.activePlayerIndex + i) % this.players.length;
      if (!this.players[idx].isEliminated) {
        nextIndex = idx;
        found = true;
        break;
      }
    }

    if (!found) {
      this.isTurnProcessing = false;
      return;
    }

    this.activePlayerIndex = nextIndex;
    this.isTurnProcessing = false;

    const nextPlayer = this.getActivePlayer();
    this.hud.renderPlayersList(this.players, this.activePlayerIndex);
    this.hud.updateTurnDisplay(nextPlayer, false);
    this.hud.setRollButtonEnabled(true);
    this.hud.logEvent(`It is now ${nextPlayer.config.name}'s turn. Roll the dice!`);
    this.cameraDirector.focusOnBoard();
  }

  update(delta) {
    this.updateMovement(delta);
    this.cameraDirector?.update?.(delta);
    this.auraManager?.update?.(delta);
    this.players.forEach(p => p.animator?.update?.(delta));
    this.spiderMen.forEach(s => s?.update?.(delta));
    this.greenGoblins.forEach(g => g?.update?.(delta));
    this.portals.forEach(p => p?.update?.(delta));
    if (this.drOctopus) this.drOctopus?.update?.(delta);
  }
}
