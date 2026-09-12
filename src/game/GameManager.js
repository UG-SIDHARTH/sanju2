// ==========================================================================
// GAME MANAGER - 6 Spider-Men, 3 Goblins, 2 Dark Portals, Exact 100 & Online P2P
// Japanese/Chinese Anime Aesthetics, Flowing Aura, Peak Cinematic Climax
// ==========================================================================

import * as THREE from 'three';
import { CharacterFactory } from './CharacterFactory.js';
import { SpiderMan } from './SpiderMan.js';
import { GreenGoblin } from './GreenGoblin.js';
import { Dice3D } from './Dice3D.js';
import { CameraDirector } from './CameraDirector.js';
import { DrOctopus } from './DrOctopus.js';
import { Portal } from './Portal.js';
import { AuraManager } from './AuraManager.js';
import { NetworkManager } from './NetworkManager.js';

export class GameManager {
  constructor(scene, camera, renderer, audioManager, comicFX) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.audioManager = audioManager;
    this.comicFX = comicFX;

    this.board = null;
    this.cameraDirector = new CameraDirector(camera, renderer.domElement);
    this.dice = new Dice3D(scene, audioManager);
    this.hud = null;

    // Flowing Anime Aura & Speed Lines
    this.auraManager = new AuraManager(scene, camera);

    // Online Multiplayer via WebRTC PeerJS
    this.networkManager = new NetworkManager(this);

    // Doctor Octopus (Tile 100 Climax)
    this.drOctopus = new DrOctopus(scene, audioManager, comicFX);

    // Game state
    this.players = [];
    this.activePlayerIndex = 0;
    this.isTurnProcessing = false;
    this.bonusRollEarned = false;

    // Entities: Exactly 6 Spider-Men, 3 Green Goblins & 2 Dark Portals
    this.spiderMen = [];
    this.greenGoblins = [];
    this.portals = [];

    this.spideyConfig = [];
    this.goblinConfig = [];
    this.portalConfigs = [];
    this.portalMap = {};
    this.goblinDropMap = {};

    this.activeMovement = null;
    this.isTurbo = false;
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

  // --- PROCEDURAL GENERATOR: 6 SPIDER-MEN, 3 GOBLINS, 2 DARK PORTALS ---
  generateRandomBoardLayout() {
    const usedTiles = new Set([1, 100]);

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

    // 1. Generate 6 Spider-Man ladders (station > trigger, well distributed across tiers)
    // Tiers: [12-28], [29-45], [46-62], [63-76], [77-88], [89-98]
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
    // Tiers: mid-tier [35-55], upper-mid [60-78], high-tier [82-96]
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

    // 3. Exactly 2 Dark Void Portals (Reversible / Bidirectional)
    this.portalMap = {};
    const portalTiers = [
      { startMin: 20, startMax: 45, destMin: 65, destMax: 85, theme: 'dark_void' },
      { startMin: 46, startMax: 64, destMin: 6, destMax: 24, theme: 'dark_crimson' }
    ];

    this.portalConfigs = portalTiers.map((tier, idx) => {
      const start = pickTile(tier.startMin, tier.startMax);
      const dest = pickTile(tier.destMin, tier.destMax);
      this.portalMap[start] = dest;
      this.portalMap[dest] = start;
      return { id: idx + 1, start, dest, theme: tier.theme };
    });
  }

  // --- START NEW 2-PLAYER MATCH ---
  startNewMatch(playerCount = 2) {
    // Only 2-player mode
    const count = 2;

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
      this.drOctopus.root.visible = false;
      this.drOctopus.isAbducting = false;
    }

    // Spawn 2 Players (MJ-1 and MJ-2)
    for (let i = 0; i < count; i++) {
      const char = CharacterFactory.createMJ(i);
      char.currentTile = 1;
      char.isEliminated = false;
      this.scene.add(char.root);
      this.players.push(char);

      // Add flowing celestial anime aura to players
      this.auraManager.createCharacterAura(char.root, i === 0 ? 0xef4444 : 0x06b6d4, 0.9);
    }

    // Generate fresh, completely randomized board if host or local
    if (!this.networkManager.isOnline() || this.networkManager.mode === 'host') {
      this.generateRandomBoardLayout();
    }

    this.spawnEntitiesFromConfig();

    this.updatePlayerPositionsOnTile(1);

    this.activePlayerIndex = 0;
    this.isTurnProcessing = false;
    this.bonusRollEarned = false;

    this.hud.renderPlayersList(this.players, this.activePlayerIndex);
    this.hud.updateTurnDisplay(this.getActivePlayer(), false);
    this.hud.setRollButtonEnabled(this.networkManager.isMyTurn(this.activePlayerIndex));

    this.hud.logEvent(`Match started! 6 Spider-Men, 3 Green Goblins & 2 Dark Void Portals randomized.`);
    this.cameraDirector.focusOnBoard();

    // If hosting online multiplayer, broadcast sync to client
    if (this.networkManager.mode === 'host') {
      this.networkManager.sendMatchSync();
    }
  }

  spawnEntitiesFromConfig() {
    // 1. Spawn 6 Spider-Men
    this.spiderMen = [];
    this.spideyConfig.forEach(cfg => {
      const spidey = new SpiderMan(this.scene, cfg.id, cfg.station, this.audioManager, this.comicFX, this.board);
      const pos = this.board.getTileWorldPosition(cfg.station);
      spidey.setPosition(pos);
      spidey.setTriggerTile(cfg.trigger);
      this.spiderMen.push(spidey);

      // Heroic anime aura
      this.auraManager.createCharacterAura(spidey.root, 0x38bdf8, 1.0);
    });

    // 2. Spawn 3 Green Goblins
    this.greenGoblins = [];
    this.goblinConfig.forEach(cfg => {
      const goblin = new GreenGoblin(this.scene, cfg.id, cfg.station, this.audioManager, this.comicFX);
      const pos = this.board.getTileWorldPosition(cfg.station);
      goblin.setPosition(pos);
      this.greenGoblins.push(goblin);

      // Cursed anime toxic aura
      this.auraManager.createCharacterAura(goblin.root, 0xa855f7, 1.0);
    });

    // 3. Spawn 2 Dark Void Portals
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

    // Refresh 100-Tile board visuals with exact markers
    const spideyTriggers = this.spideyConfig.map(s => s.trigger);
    const goblinHazardTiles = this.goblinConfig.map(g => g.station);
    this.board.setSpecialTiles(spideyTriggers, goblinHazardTiles, this.portalMap);
  }

  // Apply match sync received from Host over WebRTC
  applyRemoteMatchSync(syncPayload) {
    this.spideyConfig = syncPayload.spiderMen;
    this.goblinConfig = syncPayload.goblins;
    this.portalConfigs = syncPayload.portals;

    this.goblinDropMap = {};
    this.goblinConfig.forEach(g => {
      this.goblinDropMap[g.station] = g.drop;
    });

    this.portalMap = {};
    this.portalConfigs.forEach(p => {
      this.portalMap[p.start] = p.dest;
      this.portalMap[p.dest] = p.start;
    });

    this.spawnEntitiesFromConfig();
    this.activePlayerIndex = syncPayload.activePlayerIndex || 0;
    this.hud.renderPlayersList(this.players, this.activePlayerIndex);
    this.hud.updateTurnDisplay(this.getActivePlayer(), false);
    this.hud.setRollButtonEnabled(this.networkManager.isMyTurn(this.activePlayerIndex));
  }

  getActivePlayer() {
    return this.players[this.activePlayerIndex];
  }

  // Local or Host Dice Roll Trigger
  handleRollDice() {
    if (this.isTurnProcessing) return;
    if (!this.networkManager.isMyTurn(this.activePlayerIndex)) return;

    this.isTurnProcessing = true;
    this.hud.setRollButtonEnabled(false);

    const activePlayer = this.getActivePlayer();
    const diceRoll = this.getRandomInt(1, 6);

    if (this.networkManager.isOnline()) {
      this.networkManager.sendDiceRoll(diceRoll);
    }

    this.executeDiceRoll(diceRoll, activePlayer);
  }

  // Remote Opponent Dice Roll
  applyRemoteDiceRoll(diceRoll, playerIndex) {
    if (this.isTurnProcessing) return;
    this.isTurnProcessing = true;
    this.hud.setRollButtonEnabled(false);

    const activePlayer = this.players[playerIndex] || this.getActivePlayer();
    this.executeDiceRoll(diceRoll, activePlayer);
  }

  // --- DICE ROLL EXECUTION & EXACT 100 WIN RULE ---
  executeDiceRoll(diceRoll, activePlayer) {
    this.hud.logEvent(`${activePlayer.config.name} rolling 3D dice...`);

    this.dice.roll(diceRoll, activePlayer.root.position, () => {
      this.hud.logEvent(`${activePlayer.config.name} rolled a ${diceRoll}!`, true);

      const startTile = activePlayer.currentTile;
      const neededToReach100 = 100 - startTile;

      // --- EXACT 100 RULE ---
      // If at 99, exactly need 1 to reach 100!
      // If roll > needed, the player CANNOT move!
      if (startTile + diceRoll > 100) {
        this.comicFX.spawnAt(
          activePlayer.root.position,
          `NEED EXACT ${neededToReach100}!`,
          '#ef4444',
          '#ffffff',
          2.0
        );
        this.audioManager.playFootstep();
        this.hud.logEvent(
          `🚫 Over-rolled! ${activePlayer.config.name} needs an exact ${neededToReach100} to reach Tile 100!`,
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
      if (diceRoll === 6 && (startTile + actualSteps) < 100) {
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

    // 1. EXACT TILE 100 REACHED: TRIGGER EPIC CLIMAX!
    if (landedTile === 100) {
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

    // 2.75 Dark Void Portal Warp
    const triggeredPortal = this.portals.find(p => p.hasTile(landedTile));
    if (triggeredPortal) {
      const destTile = triggeredPortal.getDestination(landedTile);
      this.hud.logEvent(`🌀 DARK VOID PORTAL ACTIVATED on Tile ${landedTile}! Warping ${player.config.name} to Tile ${destTile}!`, true);

      this.auraManager.triggerSpeedLines(1.5, 0.8);
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
          this.hud.logEvent(`✨ ${player.config.name} emerged through the dark rift onto Tile ${player.currentTile}!`);

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

  // --- EPIC TILE 100 CLIMAX: 6 SPIDER-MEN VS DOCTOR OCTOPUS ---
  handleSecret100Reached(player) {
    this.audioManager.playSuspenseHeartbeat();
    const tile100Pos = this.board.getTileWorldPosition(100);
    this.cameraDirector.focusOnTile100(tile100Pos);
    this.hud.logEvent(`⚡ ${player.config.name} REACHED TILE 100! THE CLIMAX BEGINS!`, true);

    setTimeout(() => {
      // 1. Doctor Octopus descends and grabs MJ, then throws her down!
      this.drOctopus.triggerAbduction(
        player,
        // onThrown callback:
        (thrownMJ) => {
          this.executeSpiderMenTeamUpShowdown(thrownMJ, tile100Pos);
        },
        (docPos, mjPos, progress) => {
          this.cameraDirector.trackFlyingGoblin(docPos, mjPos, progress);
        }
      );
    }, 1000);
  }

  executeSpiderMenTeamUpShowdown(fallingMJ, tile100Pos) {
    // 2. Fullscreen Anime Speed Lines & Japanese Kanji Calligraphy Action Flash!
    this.auraManager.triggerSpeedLines(4.0, 1.0);
    this.comicFX.showBanner('ALL 6 SPIDER-MEN ASSEMBLE! MULTIVERSE TEAM ATTACK!');
    this.audioManager.playDocOckEmergence();

    const docPos = this.drOctopus.root.position;
    const attackWords = ['【轟】', 'SMASH!', '【瞬】', 'ORA!', '【極】', 'IMPACT!'];

    // 3. All 6 Spider-Men simultaneously leap from their stations across the board!
    let hitsLanded = 0;
    this.spiderMen.forEach((spidey, idx) => {
      setTimeout(() => {
        spidey.leapToAttack(docPos, idx, () => {
          hitsLanded++;
          this.drOctopus.takeHit(docPos, attackWords[idx % attackWords.length]);

          // When all 6 strikes have landed:
          if (hitsLanded === this.spiderMen.length) {
            this.defeatDocOckAndRescueMJ(fallingMJ, tile100Pos);
          }
        });
      }, idx * 180);
    });
  }

  defeatDocOckAndRescueMJ(fallingMJ, tile100Pos) {
    // 4. Doctor Octopus is defeated, sparks burst, tentacles collapse, and he falls off!
    this.drOctopus.defeatCollapse(() => {
      this.hud.logEvent('💥 DOCTOR OCTOPUS DEFEATED! Skyline cleared!');
    });

    // 5. 5 Spider-Men swing away heroically toward the distant skyscraper skyline!
    const heroSpidey = this.spiderMen[0];
    const departingSpideys = this.spiderMen.slice(1);

    departingSpideys.forEach((s, idx) => {
      setTimeout(() => {
        const angle = (idx / departingSpideys.length) * Math.PI * 2;
        s.swingAwayToSkyline(angle);
      }, 300 + idx * 150);
    });

    // 6. 1 Hero Spider-Man dives down, catches falling MJ in mid-air, and brings her to safety!
    setTimeout(() => {
      this.auraManager.triggerSpeedLines(2.5, 1.0);
      heroSpidey.diveAndCatchMJ(fallingMJ, tile100Pos, () => {
        // Crown this MJ as the WINNER!
        this.audioManager.playVictory();
        this.hud.showSecret100Reveal(fallingMJ, true);
        this.hud.logEvent(`🏆 ${fallingMJ.config.name} WAS RESCUED AND CROWNED THE CHAMPION! VICTORY!`, true);
      });
    }, 800);
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

    if (playersOnTile.length === 1) {
      playersOnTile[0].root.position.set(baseTilePos.x, 0.1, baseTilePos.z);
    } else if (playersOnTile.length > 1) {
      const radius = 0.65;
      playersOnTile.forEach((p, idx) => {
        const angle = (idx / playersOnTile.length) * Math.PI * 2;
        const offsetX = Math.cos(angle) * radius;
        const offsetZ = Math.sin(angle) * radius;
        p.root.position.set(baseTilePos.x + offsetX, 0.1, baseTilePos.z + offsetZ);
      });
    }
  }

  finishTurn(hasBonusRoll) {
    const activePlayer = this.getActivePlayer();

    if (hasBonusRoll && !activePlayer.isEliminated) {
      this.isTurnProcessing = false;
      this.bonusRollEarned = true;
      this.hud.updateTurnDisplay(activePlayer, true);
      this.hud.setRollButtonEnabled(this.networkManager.isMyTurn(this.activePlayerIndex));
      this.hud.logEvent(`⚡ ${activePlayer.config.name} has a BONUS ROLL ready!`);
    } else {
      this.advanceToNextPlayer();
    }
  }

  advanceToNextPlayer() {
    this.bonusRollEarned = false;
    this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
    this.isTurnProcessing = false;

    const nextPlayer = this.getActivePlayer();
    this.hud.renderPlayersList(this.players, this.activePlayerIndex);
    this.hud.updateTurnDisplay(nextPlayer, false);
    this.hud.setRollButtonEnabled(this.networkManager.isMyTurn(this.activePlayerIndex));

    if (this.networkManager.isOnline()) {
      if (this.networkManager.isMyTurn(this.activePlayerIndex)) {
        this.hud.logEvent(`🎮 YOUR TURN! Roll the 3D dice!`);
      } else {
        this.hud.logEvent(`⏳ Waiting for Opponent (${nextPlayer.config.name}) to roll...`);
      }
    } else {
      this.hud.logEvent(`It is now ${nextPlayer.config.name}'s turn. Roll the dice!`);
    }

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
