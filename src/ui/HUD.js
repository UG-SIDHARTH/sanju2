// ==========================================================================
// HUD - Game UI Manager, Player Status, Event Log, Modals & Mobile Touch
// ==========================================================================

import confetti from 'canvas-confetti';
import { MJ_CONFIGS } from '../game/CharacterFactory.js';

export class HUD {
  constructor(gameManager) {
    this.gameManager = gameManager;

    // DOM Elements
    this.gameUi = document.getElementById('game-ui');
    this.startScreen = document.getElementById('start-screen');
    this.rulesModal = document.getElementById('rules-modal');
    this.revealScreen = document.getElementById('reveal-screen');

    this.playersList = document.getElementById('players-list');
    this.currentPlayerName = document.getElementById('current-player-name');
    this.currentPlayerTile = document.getElementById('current-player-tile');
    this.currentHairIndicator = document.getElementById('current-hair-indicator');
    this.btnRollDice = document.getElementById('btn-roll-dice');
    this.turnExtraMsg = document.getElementById('turn-extra-msg');
    this.actionTicker = document.getElementById('action-ticker');

    this.btnCameraMode = document.getElementById('btn-camera-mode');
    this.btnSoundToggle = document.getElementById('btn-sound-toggle');
    this.btnRules = document.getElementById('btn-rules');
    this.btnCloseRules = document.getElementById('btn-close-rules');
    this.btnOkRules = document.getElementById('btn-ok-rules');
    this.btnNewMatch = document.getElementById('btn-new-match');
    this.btnStartGame = document.getElementById('btn-start-game');
    this.btnPlayAgain = document.getElementById('btn-play-again');

    this.selectedPlayerCount = 3;
    this.setupListeners();
  }

  setupListeners() {
    // Player count buttons on Start Screen
    const countBtns = document.querySelectorAll('.player-count-btn');
    countBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        countBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedPlayerCount = parseInt(btn.dataset.count, 10);
        this.updateCharacterPreview(this.selectedPlayerCount);
      });
    });

    // Start Game
    this.btnStartGame.addEventListener('click', () => {
      this.gameManager.audioManager.init();
      this.startScreen.classList.add('hidden');
      this.gameUi.classList.remove('hidden');
      this.gameManager.startNewMatch(this.selectedPlayerCount);
    });

    // Roll Dice
    this.btnRollDice.addEventListener('click', () => {
      this.gameManager.handleRollDice();
    });

    // Keyboard Spacebar for rolling
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !this.btnRollDice.disabled && !this.gameUi.classList.contains('hidden')) {
        e.preventDefault();
        this.gameManager.handleRollDice();
      }
    });

    // Camera Mode Toggle
    this.btnCameraMode.addEventListener('click', () => {
      const mode = this.gameManager.cameraDirector.toggleMode();
      const label = mode.charAt(0).toUpperCase() + mode.slice(1);
      this.btnCameraMode.querySelector('.label').textContent = label;
      this.logEvent(`Camera mode changed to: ${label}`);
    });

    // Sound Toggle
    this.btnSoundToggle.addEventListener('click', () => {
      const isUnmuted = this.gameManager.audioManager.toggleMute();
      this.btnSoundToggle.querySelector('.label').textContent = isUnmuted ? 'Sound ON' : 'Muted';
      this.btnSoundToggle.querySelector('.icon').textContent = isUnmuted ? '🔊' : '🔇';
    });

    // Rules Modal
    this.btnRules.addEventListener('click', () => {
      this.rulesModal.classList.remove('hidden');
    });
    this.btnCloseRules.addEventListener('click', () => {
      this.rulesModal.classList.add('hidden');
    });
    this.btnOkRules.addEventListener('click', () => {
      this.rulesModal.classList.add('hidden');
    });

    // New Match
    this.btnNewMatch.addEventListener('click', () => {
      if (confirm('Start a brand new match? Player positions will reset and trigger tiles will randomize.')) {
        this.gameManager.startNewMatch(this.selectedPlayerCount);
      }
    });

    // Play Again button on Reveal Screen
    this.btnPlayAgain.addEventListener('click', () => {
      this.revealScreen.classList.add('hidden');
      this.startScreen.classList.remove('hidden');
      this.gameUi.classList.add('hidden');
    });
  }

  updateCharacterPreview(count) {
    const cards = document.querySelectorAll('.char-card');
    cards.forEach((card, idx) => {
      if (idx < count) {
        card.classList.remove('inactive');
        card.classList.add('active');
      } else {
        card.classList.remove('active');
        card.classList.add('inactive');
      }
    });
  }

  // Render leaderboard side panel
  renderPlayersList(players, currentActiveIndex) {
    this.playersList.innerHTML = '';

    players.forEach((player, idx) => {
      const card = document.createElement('div');
      card.className = `player-item ${idx === currentActiveIndex ? 'active-turn' : ''} ${player.isEliminated ? 'eliminated' : ''}`;

      card.innerHTML = `
        <div class="player-avatar-mini" style="background-color: ${player.config.hex};">
          ${player.config.id}
        </div>
        <div class="player-details">
          <div class="player-name-row">
            <span class="player-name">${player.config.name}</span>
            <span class="player-pos-badge">#${player.currentTile}</span>
          </div>
          <span class="player-status-tag">${player.isEliminated ? 'ELIMINATED' : player.config.hairName}</span>
        </div>
      `;
      this.playersList.appendChild(card);
    });
  }

  // Update bottom turn card
  updateTurnDisplay(player, hasBonusRoll = false) {
    this.currentPlayerName.textContent = player.config.name;
    this.currentPlayerTile.textContent = player.currentTile;
    this.currentHairIndicator.style.backgroundColor = player.config.hex;

    if (hasBonusRoll) {
      this.turnExtraMsg.classList.remove('hidden');
    } else {
      this.turnExtraMsg.classList.add('hidden');
    }
  }

  setRollButtonEnabled(enabled) {
    this.btnRollDice.disabled = !enabled;
  }

  logEvent(message, highlight = false) {
    this.actionTicker.innerHTML = `<span class="ticker-item ${highlight ? 'highlight' : ''}">${message}</span>`;
  }

  // Show Secret 100 Reveal Screen
  showSecret100Reveal(player, isWin, onDismiss) {
    const titleEl = document.getElementById('reveal-title');
    const subtitleEl = document.getElementById('reveal-subtitle');
    const playerCardEl = document.getElementById('reveal-player-card');

    titleEl.className = `reveal-title ${isWin ? 'win' : 'lose'}`;
    titleEl.textContent = isWin ? 'YOU WIN!' : 'TOTAL TRAP!';

    subtitleEl.textContent = isWin
      ? `${player.config.name} conquered Tile 100! The multiverse is saved!`
      : `${player.config.name} triggered the Trapdoor! ELIMINATED! The remaining MJs battle on!`;

    playerCardEl.innerHTML = `
      <div class="player-avatar-mini" style="background-color: ${player.config.hex}; width: 44px; height: 44px; font-size: 1.2rem;">
        ${player.config.id}
      </div>
      <div>
        <h3 style="color: #fff; font-family: var(--font-display); font-size: 1.6rem;">${player.config.name}</h3>
        <p style="color: var(--color-gold); font-weight: 600;">Reached Tile 100</p>
      </div>
    `;

    this.revealScreen.classList.remove('hidden');

    if (isWin) {
      // Fire victory confetti bursts
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 }
        });
      }, 500);
    }

    // Auto dismiss after 4.5 seconds if game continues (elimination)
    if (!isWin) {
      setTimeout(() => {
        this.revealScreen.classList.add('hidden');
        if (onDismiss) onDismiss();
      }, 4000);
    }
  }
}
