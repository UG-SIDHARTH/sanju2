// ==========================================================================
// GAME MANAGER - 5 Spider-Men, 6 Goblins, High-Entropy RNG & Exact 100 Rule
// ==========================================================================

import * as THREE from 'three';
import { CharacterFactory } from './CharacterFactory.js';
import { SpiderMan } from './SpiderMan.js';
import { GreenGoblin } from './GreenGoblin.js';
import { Dice3D } from './Dice3D.js';
import { CameraDirector } from './CameraDirector.js';
import { DrOctopus } from './DrOctopus.js';

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

    // Doctor Octopus (Tile 100 Ambush)
    this.drOctopus = new DrOctopus(scene, audioManager, comicFX);

    // Game state
    this.players = [];
    this.activePlayerIndex = 0;
    this.isTurnProcessing = false;
    this.bonusRollEarned = false;

    // Secret 100 Rule: true = WIN, false = LOSE (elimination)
    this.secret100IsWin = true;

    // Entities: 5 Spider-Men & 6 Green Goblins
    this.spiderMen = [];
    this.greenGoblins = [];

    this.activeMovement = null;

    this.spideyFixedTiles = [32, 52, 70, 85, 94];
    this.spideyTriggerTiles = [14, 36, 56, 72, 82];
    this.goblinFixedTiles = [26, 46, 64, 78, 89, 96];
    // Guaranteed 100% safe non-special drop tiles (never equal to any Spidey trigger or fixed station)
    this.goblinDropTiles = [10, 24, 44, 60, 68, 76];
  }

  // Strictly enforce that Green Goblin NEVER drops MJ onto any Spider-Man trigger or station tile
  getSafeGoblinDropTile(goblinTile) {
    const defaultDropMap = {
      26: 10,
      46: 24,
      64: 44,
      78: 60,
      89: 68,
      96: 76
    };

    let target = defaultDropMap[goblinTile] || Math.max(2, goblinTile - 16);

    // Strict blacklist: Spidey triggers, Spidey fixed stations, Goblin hazards, and Goal
    const forbidden = new Set([
      ...this.spideyTriggerTiles,
      ...this.spideyFixedTiles,
      ...this.goblinFixedTiles,
      100
    ]);

    // If target collides with any special tile, step down until a completely clean tile is found
    while (target > 1 && forbidden.has(target)) {
      target--;
    }

    return Math.max(1, target);
  }

  setBoard(board) {
    this.board = board;
  }

  setHUD(hud) {
    this.hud = hud;
  }

  // Multi-source cryptographically secure, unpredictable random integer with rejection sampling
  getRandomInt(min, max) {
    const range = max - min + 1;
    const maxValid = Math.floor(0xFFFFFFFF / range) * range;
    const buf = new Uint32Array(4);

    let val;
    do {
      window.crypto.getRandomValues(buf);
      const microTime = (Math.floor(performance.now() * 1000000) ^ Date.now()) >>> 0;
      val = (buf[0] ^ (buf[1] << 7) ^ (buf[2] >>> 3) ^ (buf[3] << 13) ^ microTime) >>> 0;
    } while (val >= maxValid);

    return min + (val % range);
  }

  startNewMatch(playerCount = 3) {
    // Secretly decide 100 = WIN or LOSE
    this.secret100IsWin = this.getRandomInt(0, 1) === 1;

    // Clear old entities
    this.players.forEach(p => this.scene.remove(p.root));
    this.players = [];

    this.spiderMen.forEach(s => this.scene.remove(s.root));
    this.spiderMen = [];

    this.greenGoblins.forEach(g => this.scene.remove(g.root));
    this.greenGoblins = [];

    if (this.drOctopus) {
      this.drOctopus.root.visible = false;
      this.drOctopus.isAbducting = false;
    }

    // Spawn Players (MJs)
    for (let i = 0; i < playerCount; i++) {
      const char = CharacterFactory.createMJ(i);
      char.currentTile = 1;
      char.isEliminated = false;
      this.scene.add(char.root);
      this.players.push(char);
    }

    // Spawn 5 Spider-Men with 5 Balanced Progressive Rescue Ladders (+12 to +18 tiles)
    this.spideyFixedTiles.forEach((fixedTile, idx) => {
      const spidey = new SpiderMan(this.scene, idx + 1, fixedTile, this.audioManager, this.comicFX, this.board);
      const pos = this.board.getTileWorldPosition(fixedTile);
      spidey.setPosition(pos);

      const triggerTile = this.spideyTriggerTiles[idx];
      spidey.setTriggerTile(triggerTile);
      this.spiderMen.push(spidey);
    });

    // Spawn 6 Green Goblins on Hoverboards
    this.goblinFixedTiles.forEach((fixedTile, idx) => {
      const goblin = new GreenGoblin(this.scene, idx + 1, fixedTile, this.audioManager, this.comicFX);
      const pos = this.board.getTileWorldPosition(fixedTile);
      goblin.setPosition(pos);
      this.greenGoblins.push(goblin);
    });

    // Update board visuals
    const spideyTriggers = this.spiderMen.map(s => s.triggerTileNumber);
    this.board.setSpecialTiles(spideyTriggers, this.goblinFixedTiles);

    this.updatePlayerPositionsOnTile(1);

    this.activePlayerIndex = 0;
    this.isTurnProcessing = false;
    this.bonusRollEarned = false;

    this.hud.renderPlayersList(this.players, this.activePlayerIndex);
    this.hud.updateTurnDisplay(this.getActivePlayer(), false);
    this.hud.setRollButtonEnabled(true);
    this.hud.logEvent(`Match started! 5 Spider-Men & 6 Green Goblins active.`);

    this.cameraDirector.focusOnBoard();
  }

  getActivePlayer() {
    return this.players[this.activePlayerIndex];
  }

  // Roll with completely unpredictable cryptographic RNG
  handleRollDice() {
    if (this.isTurnProcessing) return;
    this.isTurnProcessing = true;
    this.hud.setRollButtonEnabled(false);

    const activePlayer = this.getActivePlayer();
    // Cryptographically secure dice roll (1 to 6)
    const diceRoll = this.getRandomInt(1, 6);

    this.hud.logEvent(`${activePlayer.config.name} rolling 3D dice...`);

    this.dice.roll(diceRoll, activePlayer.root.position, () => {
      this.hud.logEvent(`${activePlayer.config.name} rolled a ${diceRoll}!`, true);

      // --- EXACT ROLL TO 100 RULE ---
      const startTile = activePlayer.currentTile;
      const needed = 100 - startTile;

      if (diceRoll > needed) {
        // Roll exceeds 100! Ignore the dice throw!
        this.audioManager.playDiceClick();
        this.comicFX.spawnAt(activePlayer.root.position, `TOO HIGH! NEED ${needed}`, '#ef4444', '#ffffff', 2.0);
        this.comicFX.showBanner(`ROLL ${diceRoll} TOO HIGH! NEED EXACTLY ${needed} TO REACH 100!`);
        this.hud.logEvent(`⚠️ ${activePlayer.config.name} rolled ${diceRoll}, but needs exactly ${needed} to reach 100! Turn forfeited.`, true);

        this.bonusRollEarned = false;

        // Pause so player sees the roll result, then pass turn to next player
        setTimeout(() => {
          this.advanceToNextPlayer();
        }, 1500);
        return;
      }

      // Check Bonus Roll for rolling a 6
      let getsBonusFromSix = false;
      if (diceRoll === 6) {
        getsBonusFromSix = true;
        this.comicFX.spawnAt(activePlayer.root.position, 'LUCKY 6!', '#f59e0b', '#ffffff', 1.8);
        this.audioManager.playBonusChime();
        this.hud.logEvent(`${activePlayer.config.name} rolled a 6! BONUS TURN!`, true);
      }

      this.startPlayerMovement(activePlayer, diceRoll, getsBonusFromSix);
    });
  }

  startPlayerMovement(player, steps, getsBonusFromSix) {
    // 1. If player was holding hands with Spider-Man, release cleanly before stepping forward
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

    this.activeMovement = {
      player,
      path,
      pathIndex: 0,
      stepElapsed: 0,
      stepDuration: 0.38, // 380ms per step: clean, natural, realistic bipedal walking pace
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

    // Smoothstep easing for human stepping momentum
    const ease = rawProgress * rawProgress * (3 - 2 * rawProgress);
    m.player.root.position.lerpVectors(m.fromPos, m.toPos, ease);
    m.player.root.lookAt(m.toPos.x, m.player.root.position.y, m.toPos.z);

    // Dynamic camera tracking player walking
    this.cameraDirector.focusOnPlayer(m.player.root.position);

    if (rawProgress >= 1.0) {
      // Step complete onto tile
      m.player.root.position.copy(m.toPos);
      const currentTileNum = m.path[m.pathIndex];
      m.player.currentTile = currentTileNum;

      this.hud.updateTurnDisplay(m.player, this.bonusRollEarned || m.getsBonusFromSix);
      this.hud.renderPlayersList(this.players, this.activePlayerIndex);

      m.pathIndex++;

      if (m.pathIndex < m.path.length) {
        // Setup next step
        const nextTileNum = m.path[m.pathIndex];
        m.fromPos.copy(m.toPos);
        m.toPos = this.board.getTileWorldPosition(nextTileNum);
        m.stepElapsed = 0;
        m.player.root.lookAt(m.toPos.x, m.player.root.position.y, m.toPos.z);
        this.audioManager.playFootstep();
      } else {
        // All steps completed!
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

    // 1. Secret 100 Rule (Doctor Octopus Ambush)
    if (landedTile === 100) {
      this.handleSecret100Reached(player);
      return;
    }

    // 2. Spider-Man Web Trigger
    const triggeredSpidey = this.spiderMen.find(s => s.triggerTileNumber === landedTile);
    if (triggeredSpidey) {
      this.hud.logEvent(`🕸️ SPIDER-MAN #${triggeredSpidey.id} TRIGGERED on Tile ${landedTile}! Reeling in ${player.config.name}!`, true);
      this.cameraDirector.focusOnSpiderManAction(triggeredSpidey.root.position, player.root.position);

      triggeredSpidey.triggerWebPull(player, () => {
        player.currentTile = triggeredSpidey.fixedTileNumber;
        this.updatePlayerPositionsOnTile(player.currentTile);
        this.hud.renderPlayersList(this.players, this.activePlayerIndex);
        this.hud.updateTurnDisplay(player, bonusRoll);
        this.hud.logEvent(`${player.config.name} webbed to Tile ${player.currentTile}!`);

        this.checkCollisionAndFinish(player, bonusRoll);
      });
      return;
    }

    // 2.5 Spider-Man Station Tile: Spider-Man and MJ hold hands side-by-side!
    const stationedSpidey = this.spiderMen.find(s => s.fixedTileNumber === landedTile);
    if (stationedSpidey) {
      this.audioManager.playHeroicCatch();
      stationedSpidey.holdHands(player);
    }

    // 3. Green Goblin Hazard
    const triggeredGoblin = this.greenGoblins.find(g => g.fixedTileNumber === landedTile);
    if (triggeredGoblin) {
      // Calculate guaranteed safe drop tile (strictly never on any Spider-Man trigger or station)
      const dropTile = this.getSafeGoblinDropTile(landedTile);
      const dropPos = this.board.getTileWorldPosition(dropTile);

      this.hud.logEvent(`🎃 GREEN GOBLIN #${triggeredGoblin.id} AMBUSH on Tile ${landedTile}! Flying ${player.config.name} to safe Tile ${dropTile}!`, true);

      // Trigger kidnapping with full real-time aerial camera tracking & touchdown hold
      triggeredGoblin.triggerKidnapping(
        player,
        dropPos,
        // onComplete:
        () => {
          player.currentTile = dropTile;
          this.updatePlayerPositionsOnTile(dropTile);
          this.hud.renderPlayersList(this.players, this.activePlayerIndex);
          this.hud.updateTurnDisplay(player, bonusRoll);
          this.hud.logEvent(`${player.config.name} is now safe on Tile ${dropTile}!`);

          this.checkCollisionAndFinish(player, bonusRoll);
        },
        // onFlightUpdate (tracks camera in real time so user sees full flight & destination):
        (curGoblinPos, destWorldPos, progress) => {
          if (progress >= 1.0) {
            this.cameraDirector.focusOnDestinationTile(destWorldPos);
          } else {
            this.cameraDirector.trackFlyingGoblin(curGoblinPos, destWorldPos, progress);
          }
        }
      );
      return;
    }

    // 4. Player Collision Rule
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
      this.hud.logEvent(`💥 COLLISION! ${player.config.name} landed on ${otherPlayersOnTile[0].config.name}! BONUS ROLL!`, true);
    }

    this.finishTurn(bonus);
  }

  handleSecret100Reached(player) {
    this.audioManager.playSuspenseHeartbeat();
    const tile100Pos = this.board.getTileWorldPosition(100);
    this.cameraDirector.focusOnTile100(tile100Pos);
    this.hud.logEvent(`⚡ ${player.config.name} REACHED TILE 100! SOMETHING IS COMING...`, true);

    setTimeout(() => {
      this.hud.logEvent(`🐙 AMBUSH! DOCTOR OCTOPUS DESCENDS UPON TILE 100!`, true);

      this.drOctopus.triggerAbduction(
        player,
        // onComplete:
        () => {
          this.audioManager.playDefeatGong();
          player.isEliminated = true;

          this.hud.showSecret100Reveal(player, false, () => {
            const activeSurvivors = this.players.filter(p => !p.isEliminated);
            if (activeSurvivors.length === 1) {
              const winner = activeSurvivors[0];
              this.audioManager.playVictory();
              winner.animator.setState('victory');
              this.hud.showSecret100Reveal(winner, true);
              this.hud.logEvent(`🏆 ${winner.config.name} IS THE SURVIVING MJ! VICTORY!`, true);
            } else if (activeSurvivors.length === 0) {
              this.hud.logEvent(`☠️ All MJs were abducted by Doctor Octopus! Multiverse fallen!`, true);
            } else {
              this.advanceToNextPlayer();
            }
          });
        },
        // onCameraUpdate:
        (docPos, mjPos, progress) => {
          this.cameraDirector.trackFlyingGoblin(docPos, mjPos, progress);
        }
      );
    }, 1200);
  }

  updatePlayerPositionsOnTile(tileNumber) {
    const playersOnTile = this.players.filter(p => !p.isEliminated && p.currentTile === tileNumber);
    const baseTilePos = this.board.getTileWorldPosition(tileNumber);
    const spideyOnTile = this.spiderMen.find(s => s.fixedTileNumber === tileNumber);

    if (spideyOnTile) {
      if (playersOnTile.length > 0) {
        // Spider-Man & MJ hold hands side-by-side! (No carrying)
        const partnerPlayer = playersOnTile[0];
        spideyOnTile.holdHands(partnerPlayer);

        // If additional players are also on this tile, place them safely adjacent so they do not clip
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
        // No players on this tile; release hands if Spidey was holding hands
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
      this.hud.setRollButtonEnabled(true);
      this.hud.logEvent(`⚡ ${activePlayer.config.name} has a BONUS ROLL ready!`);
    } else {
      this.advanceToNextPlayer();
    }
  }

  advanceToNextPlayer() {
    this.bonusRollEarned = false;
    let nextIdx = (this.activePlayerIndex + 1) % this.players.length;

    let loops = 0;
    while (this.players[nextIdx].isEliminated && loops < this.players.length) {
      nextIdx = (nextIdx + 1) % this.players.length;
      loops++;
    }

    this.activePlayerIndex = nextIdx;
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
    this.cameraDirector.update(delta);
    this.players.forEach(p => p.animator.update(delta));
    this.spiderMen.forEach(s => s.update(delta));
    this.greenGoblins.forEach(g => g.update(delta));
    if (this.drOctopus) this.drOctopus.update(delta);
  }
}
