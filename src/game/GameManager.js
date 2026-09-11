// ==========================================================================
// GAME MANAGER - 5 Classic Spider-Men, 6 Green Goblins, Turn State & Rules
// Fully optimized for Intel Pentium / 4GB DDR3 (60+ FPS)
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

    // Entities: Exactly 5 Spider-Men & Exactly 6 Green Goblins
    this.spiderMen = [];
    this.greenGoblins = [];

    // Fixed tiles for 5 Spider-Men and 6 Green Goblins
    this.spideyFixedTiles = [38, 55, 73, 86, 94];
    this.goblinFixedTiles = [28, 44, 62, 77, 89, 96];
  }

  setBoard(board) {
    this.board = board;
  }

  setHUD(hud) {
    this.hud = hud;
  }

  startNewMatch(playerCount = 3) {
    // 1. Secretly decide whether 100 = WIN or LOSE
    this.secret100IsWin = Math.random() > 0.5;

    // 2. Clear old entities
    this.players.forEach(p => this.scene.remove(p.root));
    this.players = [];

    this.spiderMen.forEach(s => this.scene.remove(s.root));
    this.spiderMen = [];

    this.greenGoblins.forEach(g => this.scene.remove(g.root));
    this.greenGoblins = [];

    // 3. Spawn Players (MJs)
    for (let i = 0; i < playerCount; i++) {
      const char = CharacterFactory.createMJ(i);
      char.currentTile = 1;
      char.isEliminated = false;
      this.scene.add(char.root);
      this.players.push(char);
    }

    // 4. Spawn Exactly 5 Spider-Men (All Classic Blue & Red)
    // 5 Unique Randomized Trigger Tiles
    const triggerPool = [5, 9, 14, 18, 23, 31, 35, 41, 49, 58, 66];
    triggerPool.sort(() => Math.random() - 0.5);

    this.spideyFixedTiles.forEach((fixedTile, idx) => {
      const spidey = new SpiderMan(this.scene, idx + 1, fixedTile, this.audioManager, this.comicFX);
      const pos = this.board.getTileWorldPosition(fixedTile);
      spidey.setPosition(pos);

      // Random trigger lower than fixed tile
      const triggerTile = triggerPool[idx];
      spidey.setTriggerTile(triggerTile);

      this.spiderMen.push(spidey);
    });

    // 5. Spawn Exactly 6 Green Goblins on Hoverboards
    this.goblinFixedTiles.forEach((fixedTile, idx) => {
      const goblin = new GreenGoblin(this.scene, idx + 1, fixedTile, this.audioManager, this.comicFX);
      const pos = this.board.getTileWorldPosition(fixedTile);
      goblin.setPosition(pos);
      this.greenGoblins.push(goblin);
    });

    // 6. Update board special tiles visually
    const spideyTriggers = this.spiderMen.map(s => s.triggerTileNumber);
    this.board.setSpecialTiles(spideyTriggers, this.goblinFixedTiles);

    // 7. Place players at Tile 1
    this.updatePlayerPositionsOnTile(1);

    // 8. Reset turn state
    this.activePlayerIndex = 0;
    this.isTurnProcessing = false;
    this.bonusRollEarned = false;

    this.hud.renderPlayersList(this.players, this.activePlayerIndex);
    this.hud.updateTurnDisplay(this.getActivePlayer(), false);
    this.hud.setRollButtonEnabled(true);
    this.hud.logEvent(`Match started! 5 Spider-Men & 6 Green Goblins are on the board.`);

    this.cameraDirector.focusOnBoard();
  }

  getActivePlayer() {
    return this.players[this.activePlayerIndex];
  }

  handleRollDice() {
    if (this.isTurnProcessing) return;
    this.isTurnProcessing = true;
    this.hud.setRollButtonEnabled(false);

    const activePlayer = this.getActivePlayer();
    const diceRoll = Math.floor(Math.random() * 6) + 1;

    this.hud.logEvent(`${activePlayer.config.name} rolling 3D dice...`);

    this.dice.roll(diceRoll, activePlayer.root.position, () => {
      this.hud.logEvent(`${activePlayer.config.name} rolled a ${diceRoll}!`, true);

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
    const targetTile = Math.min(100, startTile + steps);
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

      const stepDuration = 0.26;
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
      this.cameraDirector.focusOnGoblinAction(triggeredGoblin.root.position, player.root.position);

      const minDrop = Math.max(4, landedTile - 35);
      const maxDrop = Math.max(8, landedTile - 10);
      const dropTile = Math.floor(Math.random() * (maxDrop - minDrop + 1)) + minDrop;
      const dropPos = this.board.getTileWorldPosition(dropTile);

      triggeredGoblin.triggerKidnapping(player, dropPos, () => {
        player.currentTile = dropTile;
        this.updatePlayerPositionsOnTile(dropTile);
        this.hud.renderPlayersList(this.players, this.activePlayerIndex);
        this.hud.updateTurnDisplay(player, bonusRoll);
        this.hud.logEvent(`${player.config.name} dropped onto Tile ${dropTile}!`);

        this.checkCollisionAndFinish(player, bonusRoll);
      });
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
