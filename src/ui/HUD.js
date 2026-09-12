// ==========================================================================
// HUD - Game UI Manager: 2-Player Single-Device Mode, Status, Turn Card & Modals
// ==========================================================================

import confetti from 'canvas-confetti';

export class HUD {
  constructor(gameManager) {
    this.gameManager = gameManager;

    // Core Screens & Overlays
    this.gameUi = document.getElementById('game-ui');
    this.startScreen = document.getElementById('start-screen');
    this.rulesModal = document.getElementById('rules-modal');
    this.revealScreen = document.getElementById('reveal-screen');

    // In-game HUD Elements
    this.playersList = document.getElementById('players-list');
    this.currentPlayerName = document.getElementById('current-player-name');
    this.currentPlayerTile = document.getElementById('current-player-tile');
    this.currentHairIndicator = document.getElementById('current-hair-indicator');
    this.btnRollDice = document.getElementById('btn-roll-dice');
    this.turnExtraMsg = document.getElementById('turn-extra-msg');
    this.actionTicker = document.getElementById('action-ticker');

    // Controls
    this.btnTurboMode = document.getElementById('btn-turbo-mode');
    this.btnCameraMode = document.getElementById('btn-camera-mode');
    this.btnSoundToggle = document.getElementById('btn-sound-toggle');
    this.btnRules = document.getElementById('btn-rules');
    this.btnCloseRules = document.getElementById('btn-close-rules');
    this.btnOkRules = document.getElementById('btn-ok-rules');
    this.btnNewMatch = document.getElementById('btn-new-match');
    this.btnStartGame = document.getElementById('btn-start-game');
    this.btnPlayAgain = document.getElementById('btn-play-again');

    // Camera Zoom
    this.btnZoomIn = document.getElementById('btn-zoom-in');
    this.btnZoomReset = document.getElementById('btn-zoom-reset');
    this.btnZoomOut = document.getElementById('btn-zoom-out');

    this.setupListeners();
  }

  setupListeners() {
    // Turbo Speed Toggle
    if (this.btnTurboMode) {
      this.btnTurboMode.addEventListener('click', () => {
        const isTurbo = !this.gameManager.isTurbo;
        this.gameManager.setTurboMode(isTurbo);
        this.btnTurboMode.classList.toggle('active', isTurbo);
        const labelEl = this.btnTurboMode.querySelector('.label');
        if (labelEl) labelEl.textContent = isTurbo ? 'Turbo: ON' : 'Turbo: OFF';
        this.logEvent(isTurbo ? '⚡ Turbo Speed ON! Fast moves & warps.' : '⚡ Turbo Speed OFF.');
      });
    }

    // Zoom Buttons (Mouse & Mobile Touch)
    if (this.btnZoomIn) {
      this.btnZoomIn.addEventListener('click', () => {
        this.gameManager.cameraDirector.zoomIn();
      });
    }
    if (this.btnZoomReset) {
      this.btnZoomReset.addEventListener('click', () => {
        this.gameManager.cameraDirector.resetZoom();
      });
    }
    if (this.btnZoomOut) {
      this.btnZoomOut.addEventListener('click', () => {
        this.gameManager.cameraDirector.zoomOut();
      });
    }

    // Start 2-Player Game
    if (this.btnStartGame) {
      this.btnStartGame.addEventListener('click', () => {
        this.gameManager.audioManager.init();
        this.startScreen.classList.add('hidden');
        this.gameUi.classList.remove('hidden');
        this.gameManager.startNewMatch(2);
      });
    }

    // Roll Dice Button
    if (this.btnRollDice) {
      this.btnRollDice.addEventListener('click', () => {
        this.gameManager.handleRollDice();
      });
    }

    // Keyboard Spacebar for rolling
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.btnRollDice && !this.btnRollDice.disabled && !this.gameUi.classList.contains('hidden')) {
        e.preventDefault();
        this.gameManager.handleRollDice();
      }
    });

    // Camera Mode Toggle
    if (this.btnCameraMode) {
      this.btnCameraMode.addEventListener('click', () => {
        const mode = this.gameManager.cameraDirector.toggleMode();
        const label = mode.charAt(0).toUpperCase() + mode.slice(1);
        this.btnCameraMode.querySelector('.label').textContent = label;
        this.logEvent(`Camera mode changed to: ${label}`);
      });
    }

    // Sound Toggle
    if (this.btnSoundToggle) {
      this.btnSoundToggle.addEventListener('click', () => {
        const isUnmuted = this.gameManager.audioManager.toggleMute();
        this.btnSoundToggle.querySelector('.label').textContent = isUnmuted ? 'Sound ON' : 'Muted';
        this.btnSoundToggle.querySelector('.icon').textContent = isUnmuted ? '🔊' : '🔇';
      });
    }

    // Rules Modal Open / Close
    if (this.btnRules) {
      this.btnRules.addEventListener('click', () => {
        this.rulesModal.classList.remove('hidden');
      });
    }
    if (this.btnCloseRules) {
      this.btnCloseRules.addEventListener('click', () => {
        this.rulesModal.classList.add('hidden');
      });
    }
    if (this.btnOkRules) {
      this.btnOkRules.addEventListener('click', () => {
        this.rulesModal.classList.add('hidden');
      });
    }

    // New Match
    if (this.btnNewMatch) {
      this.btnNewMatch.addEventListener('click', () => {
        if (confirm('Start a brand new match? Board will re-randomize.')) {
          this.gameManager.startNewMatch(2);
        }
      });
    }

    // Play Again button on Reveal Screen
    if (this.btnPlayAgain) {
      this.btnPlayAgain.addEventListener('click', () => {
        this.revealScreen.classList.add('hidden');
        this.gameManager.startNewMatch(2);
      });
    }
  }

  // Render leaderboard side panel
  renderPlayersList(players, currentActiveIndex) {
    if (!this.playersList) return;
    this.playersList.innerHTML = '';

    players.forEach((player, idx) => {
      const card = document.createElement('div');
      const isActive = idx === currentActiveIndex;
      card.className = `player-item ${isActive ? 'active-turn' : ''} ${player.isEliminated ? 'eliminated' : ''}`;
      card.title = `Click to focus camera on ${player.config.name}`;

      const progress = Math.min(100, Math.max(1, player.currentTile));

      card.innerHTML = `
        <div class="player-avatar-mini" style="background-color: ${player.config.hex};">
          ${player.config.id}
        </div>
        <div class="player-details">
          <div class="player-name-row">
            <span class="player-name">${player.config.name}</span>
            <span class="player-pos-badge">#${player.currentTile}</span>
          </div>
          <div class="player-progress-container">
            <div class="player-progress-bar">
              <div class="player-progress-fill" style="width: ${progress}%; background: linear-gradient(90deg, ${player.config.hex}, #f59e0b);"></div>
            </div>
            <span class="player-percent">${progress}%</span>
          </div>
          <span class="player-status-tag">${player.isEliminated ? 'ELIMINATED' : player.config.hairName}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        if (player.root && this.gameManager.cameraDirector) {
          this.gameManager.cameraDirector.focusOnPlayer(player.root.position);
          this.logEvent(`Camera focused on ${player.config.name} at Tile ${player.currentTile}`);
        }
      });

      this.playersList.appendChild(card);
    });
  }

  // Update bottom turn card
  updateTurnDisplay(player, hasBonusRoll = false) {
    if (this.currentPlayerName) this.currentPlayerName.textContent = player.config.name;
    if (this.currentPlayerTile) this.currentPlayerTile.textContent = player.currentTile;
    if (this.currentHairIndicator) this.currentHairIndicator.style.backgroundColor = player.config.hex;

    const turnLabelEl = document.querySelector('.turn-label');
    if (turnLabelEl) {
      turnLabelEl.textContent = `${player.config.name.toUpperCase()}'S TURN`;
      turnLabelEl.style.color = player.config.hex;
    }

    if (this.turnExtraMsg) {
      if (hasBonusRoll) {
        this.turnExtraMsg.classList.remove('hidden');
      } else {
        this.turnExtraMsg.classList.add('hidden');
      }
    }
  }

  setRollButtonEnabled(enabled) {
    if (this.btnRollDice) {
      this.btnRollDice.disabled = !enabled;
    }
  }

  logEvent(message, highlight = false) {
    if (this.actionTicker) {
      this.actionTicker.innerHTML = `<span class="ticker-item ${highlight ? 'highlight' : ''}">${message}</span>`;
    }
  }

  // Show Doctor Octopus Tile 100 Trap Defeat Screen
  showTrapDefeat(player) {
    const titleEl = document.getElementById('reveal-title');
    const subtitleEl = document.getElementById('reveal-subtitle');
    const playerCardEl = document.getElementById('reveal-player-card');
    const badgeEl = document.getElementById('reveal-badge');

    if (badgeEl) {
      badgeEl.textContent = '💀 TOTAL TRAP!';
      badgeEl.style.backgroundColor = '#dc2626';
    }

    if (titleEl) {
      titleEl.className = 'reveal-title lose';
      titleEl.textContent = 'YOU LOSE';
      titleEl.style.color = '#ef4444';
    }

    if (subtitleEl) {
      subtitleEl.innerHTML = `<strong style="color: #fca5a5; font-size: 1.25rem;">You fell right into their trap.</strong><br><br>${player.config.name} reached Tile 100! Doctor Octopus's mechanical arms grabbed her and leaped away across the skyline toward an unknown destination...`;
    }

    if (playerCardEl) {
      playerCardEl.innerHTML = `
        <div class="player-avatar-mini" style="background-color: ${player.config.hex}; width: 48px; height: 48px; font-size: 1.3rem;">
          ${player.config.id}
        </div>
        <div>
          <h3 style="color: #fff; font-family: var(--font-display); font-size: 1.8rem;">${player.config.name}</h3>
          <p style="color: #ef4444; font-weight: 700;">CAPTURED AT TILE 100 — DEFEATED</p>
        </div>
      `;
    }

    if (this.revealScreen) {
      this.revealScreen.classList.remove('hidden');
    }
  }
}
