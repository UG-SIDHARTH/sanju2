// ==========================================================================
// GAME MANAGER - 5 Spider-Men, 6 Goblins, High-Entropy RNG & Exact 100 Rule
// ==========================================================================

import * as THREE from 'three';
import { CharacterFactory } from './CharacterFactory.js';
import { SpiderMan } from './SpiderMan.js';
import { GreenGoblin } from './GreenGoblin.js';
import { Dice3D } from './Dice3D.js';
import { CameraDirector } from './CameraDirector.js';

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

    this.spideyFixedTiles = [38, 55, 73, 86, 94];
    this.goblinFixedTiles = [28, 44, 62, 77, 89, 96];
  }

  setBoard(board) {
    this.board = board;
  }

  setHUD(hud) {
    this.hud = hud;
  }

  // Cryptographically secure random integer between min and max (inclusive)
  getRandomInt(min, max) {
    const range = max - min + 1;
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return min + (array[0] % range);
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

    // Spawn Players (MJs)
    for (let i = 0; i < playerCount; i++) {
      const char = CharacterFactory.createMJ(i);
      char.currentTile = 1;
      char.isEliminated = false;
      this.scene.add(char.root);
      this.players.push(char);
    }

    // Spawn 5 Spider-Men with 5 Unique Random Triggers
    const triggerPool = [5, 9, 14, 18, 23, 31, 35, 41, 49, 58, 66];
    // Shuffle trigger pool with crypto RNG
    for (let i = triggerPool.length - 1; i > 0; i--) {
      const j = this.getRandomInt(0, i);
      [triggerPool[i], triggerPool[j]] = [triggerPool[j], triggerPool[i]];
    }

    this.spideyFixedTiles.forEach((fixedTile, idx) => {
      const spidey = new SpiderMan(this.scene, idx + 1, fixedTile, this.audioManager, this.comicFX);
      const pos = this.board.getTileWorldPosition(fixedTile);
      spidey.setPosition(pos);

      const triggerTile = triggerPool[idx];
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
        // Roll exceeds 100! Forfeit turn!
        this.audioManager.playDiceClick();
        this.comicFX.spawnAt(activePlayer.root.position, `TOO HIGH! NEED ${needed}`, '#ef4444', '#ffffff', 2.0);
        this.hud.logEvent(`⚠️ ${activePlayer.config.name} rolled ${diceRoll}, but needs exactly ${needed} to reach 100! Turn forfeited.`, true);

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

      this.movePlayerStepByStep(activePlayer, diceRoll, getsBonusFromSix);
    });
  }

  movePlayerStepByStep(player, steps, getsBonusFromSix) {
    const startTile = player.currentTile;
    const targetTile = startTile + steps;
    const tileSequence = [];

    for (let t = startTile + 1; t <= targetTile; t++) {
      tileSequence.push(t);
    }

    if (tileSequence.length === 0) {
      this.finishTurn(getsBonusFromSix);
      return;
    }

    let stepIndex = 0;
    player.animator.setState('walking');

    const walkNextStep = () => {
      if (stepIndex >= tileSequence.length) {
        player.currentTile = targetTile;
        player.animator.setState('idle');
        this.updatePlayerPositionsOnTile(targetTile);
        this.hud.renderPlayersList(this.players, this.activePlayerIndex);
        this.hud.updateTurnDisplay(player, this.bonusRollEarned || getsBonusFromSix);

        this.checkTileEvents(player, targetTile, getsBonusFromSix);
        return;
      }

      const nextTileNum = tileSequence[stepIndex];
      const fromPos = player.root.position.clone();
      const toPos = this.board.getTileWorldPosition(nextTileNum);

      player.root.lookAt(toPos.x, player.root.position.y, toPos.z);

      const stepDuration = 0.25;
      const startTime = performance.now();

      this.audioManager.playFootstep();
      this.cameraDirector.focusOnPlayer(toPos);

      const animateStep = () => {
        const now = performance.now();
        const progress = (now - startTime) / (stepDuration * 1000);

        if (progress < 1.0) {
          const currentPos = new THREE.Vector3().lerpVectors(fromPos, toPos, progress);
          player.root.position.copy(currentPos);
          requestAnimationFrame(animateStep);
        } else {
          player.root.position.copy(toPos);
          player.currentTile = nextTileNum;
          this.hud.updateTurnDisplay(player, this.bonusRollEarned || getsBonusFromSix);
          stepIndex++;
          walkNextStep();
        }
      };

      requestAnimationFrame(animateStep);
    };

    walkNextStep();
  }

  checkTileEvents(player, landedTile, hadBonusRoll) {
    let bonusRoll = hadBonusRoll;

    // 1. Secret 100 Rule
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

    // 3. Green Goblin Hazard
    const triggeredGoblin = this.greenGoblins.find(g => g.fixedTileNumber === landedTile);
    if (triggeredGoblin) {
      this.hud.logEvent(`🎃 GREEN GOBLIN #${triggeredGoblin.id} AMBUSH on Tile ${landedTile}! Kidnapping ${player.config.name}!`, true);

      // --- GUARANTEE: NEVER DROP ON SPIDER-MAN TRIGGER OR HAZARD TILE ---
      const spideyTriggers = this.spiderMen.map(s => s.triggerTileNumber);
      const forbidden = new Set([
        ...this.spideyFixedTiles,
        ...spideyTriggers,
        ...this.goblinFixedTiles,
        100
      ]);

      // Collect all safe lower tiles
      const safeCandidates = [];
      const minTile = 2;
      const maxTile = Math.max(2, landedTile - 8);

      for (let t = minTile; t <= maxTile; t++) {
        if (!forbidden.has(t)) {
          safeCandidates.push(t);
        }
      }

      // Fallback to any safe tile on board below landedTile if candidates are tight
      if (safeCandidates.length === 0) {
        for (let t = 2; t < landedTile; t++) {
          if (!forbidden.has(t)) safeCandidates.push(t);
        }
      }

      // Cryptographically pick a safe tile
      const dropTile = safeCandidates.length > 0
        ? safeCandidates[this.getRandomInt(0, safeCandidates.length - 1)]
        : Math.max(1, landedTile - 15);

      const dropPos = this.board.getTileWorldPosition(dropTile);

      // Trigger kidnapping with full real-time aerial camera tracking
      triggeredGoblin.triggerKidnapping(
        player,
        dropPos,
        // onComplete:
        () => {
          player.currentTile = dropTile;
          this.updatePlayerPositionsOnTile(dropTile);
          this.hud.renderPlayersList(this.players, this.activePlayerIndex);
          this.hud.updateTurnDisplay(player, bonusRoll);
          this.hud.logEvent(`${player.config.name} dropped onto safe Tile ${dropTile}!`);

          this.checkCollisionAndFinish(player, bonusRoll);
        },
        // onFlightUpdate (tracks camera in real time so user sees full flight):
        (curGoblinPos, destWorldPos, progress) => {
          this.cameraDirector.trackFlyingGoblin(curGoblinPos, destWorldPos, progress);
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
    this.cameraDirector.focusOnTile100(this.board.getTileWorldPosition(100));
    this.hud.logEvent(`⚡ ${player.config.name} REACHED TILE 100! EVALUATING OUTCOME...`, true);

    setTimeout(() => {
      const isWin = this.secret100IsWin;

      if (isWin) {
        this.audioManager.playVictory();
        player.animator.setState('victory');
        this.comicFX.spawnAt(player.root.position, 'VICTORY!', '#10b981', '#ffffff', 3.0);
        this.hud.showSecret100Reveal(player, true);
        this.hud.logEvent(`🏆 ${player.config.name} WINS THE GAME!`, true);
      } else {
        this.audioManager.playDefeatGong();
        player.isEliminated = true;
        player.animator.setState('defeat');
        this.comicFX.spawnAt(player.root.position, 'TRAP!', '#ef4444', '#ffffff', 3.0);

        this.hud.showSecret100Reveal(player, false, () => {
          const activeSurvivors = this.players.filter(p => !p.isEliminated);
          if (activeSurvivors.length === 1) {
            const winner = activeSurvivors[0];
            this.audioManager.playVictory();
            winner.animator.setState('victory');
            this.hud.showSecret100Reveal(winner, true);
            this.hud.logEvent(`🏆 ${winner.config.name} IS THE SURVIVING MJ! VICTORY!`, true);
          } else {
            this.advanceToNextPlayer();
          }
        });
      }
    }, 1500);
  }

  updatePlayerPositionsOnTile(tileNumber) {
    const playersOnTile = this.players.filter(p => !p.isEliminated && p.currentTile === tileNumber);
    const baseTilePos = this.board.getTileWorldPosition(tileNumber);

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
    this.cameraDirector.update(delta);
    this.players.forEach(p => p.animator.update(delta));
    this.spiderMen.forEach(s => s.update(delta));
    this.greenGoblins.forEach(g => g.update(delta));
  }
}
