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
    this.ambushModal = document.getElementById('ambush-modal');
    this.btnContinueRace = document.getElementById('btn-continue-race');
    this.selectedPlayerCount = 2;
    this.selectedMaxTiles = 60; // Default to Quick Mode (60 Tiles)
    this.onAmbushDismiss = null;

    // Camera Zoom
    this.btnZoomIn = document.getElementById('btn-zoom-in');
    this.btnZoomReset = document.getElementById('btn-zoom-reset');
    this.btnZoomOut = document.getElementById('btn-zoom-out');

    // Showcase Demo Elements
    this.btnWatchDemo = document.getElementById('btn-watch-demo');
    this.btnTopDemo = document.getElementById('btn-top-demo');
    this.demoHud = document.getElementById('demo-hud');
    this.btnDemoPrev = document.getElementById('btn-demo-prev');
    this.btnDemoPause = document.getElementById('btn-demo-pause');
    this.btnDemoNext = document.getElementById('btn-demo-next');
    this.btnDemoExit = document.getElementById('btn-demo-exit');
    this.demoSceneTitle = document.getElementById('demo-scene-title');
    this.demoSceneSubtitle = document.getElementById('demo-scene-subtitle');

    this.setupListeners();
    this.updateStartButtonText();
  }

  showDemoHUD(visible) {
    if (this.demoHud) {
      this.demoHud.classList.toggle('hidden', !visible);
    }
    const turnCard = document.getElementById('turn-card');
    if (turnCard) {
      turnCard.style.display = visible ? 'none' : '';
    }
    const ticker = document.querySelector('.action-ticker-container');
    if (ticker) {
      ticker.style.display = visible ? 'none' : '';
    }
  }

  updateDemoSceneInfo(sceneDef) {
    if (this.demoSceneTitle) {
      this.demoSceneTitle.textContent = sceneDef.title;
    }
    if (this.demoSceneSubtitle) {
      this.demoSceneSubtitle.textContent = sceneDef.subtitle;
    }
    if (this.btnDemoPause) {
      this.btnDemoPause.textContent = '⏸️ Pause';
      this.btnDemoPause.classList.remove('active');
    }
  }

  updateDemoPauseButton(isPaused) {
    if (this.btnDemoPause) {
      this.btnDemoPause.textContent = isPaused ? '▶️ Resume' : '⏸️ Pause';
      this.btnDemoPause.classList.toggle('active', isPaused);
    }
  }

  updateStartButtonText() {
    const startTextEl = document.getElementById('btn-start-text');
    if (startTextEl) {
      const modeLabel = this.selectedMaxTiles === 60 ? 'QUICK (60 TILES)' : 'CLASSIC (100 TILES)';
      startTextEl.textContent = `START ${this.selectedPlayerCount}P ${modeLabel}`;
    }
  }

  updateSidePanelTarget() {
    const targetEl = document.getElementById('panel-target');
    if (targetEl) {
      targetEl.textContent = `GOAL: TILE ${this.selectedMaxTiles} (🐙)`;
    }
  }

  setupListeners() {
    // Game Mode Buttons (Quick 60 vs Classic 100)
    const modeBtns = document.querySelectorAll('.game-mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tiles = parseInt(btn.dataset.tiles, 10) || 60;
        this.selectedMaxTiles = tiles;
        modeBtns.forEach(b => b.classList.toggle('active', b === btn));
        this.updateStartButtonText();
      });
    });

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

    // Player Count Buttons (2P, 3P, 4P)
    const countBtns = document.querySelectorAll('.player-count-btn');
    countBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const count = parseInt(btn.dataset.count, 10) || 2;
        this.selectedPlayerCount = count;

        countBtns.forEach(b => b.classList.toggle('active', b === btn));

        // Update preview cards active/inactive states
        const charCards = document.querySelectorAll('.char-card');
        charCards.forEach(c => {
          const charId = parseInt(c.dataset.char, 10);
          if (charId <= count) {
            c.classList.remove('inactive');
            c.classList.add('active');
          } else {
            c.classList.add('inactive');
            c.classList.remove('active');
          }
        });

        this.updateStartButtonText();

        const subtitleBadge = document.getElementById('mode-subtitle-badge');
        if (subtitleBadge) {
          subtitleBadge.textContent = `🎮 ${count} PLAYERS — SINGLE DEVICE`;
        }
      });
    });

    // Start Game
    if (this.btnStartGame) {
      this.btnStartGame.addEventListener('click', () => {
        this.gameManager.audioManager.init();
        this.startScreen.classList.add('hidden');
        this.gameUi.classList.remove('hidden');
        this.updateSidePanelTarget();
        this.gameManager.startNewMatch(this.selectedPlayerCount, this.selectedMaxTiles);
      });
    }

    // Start Showcase Demo from Start Modal
    if (this.btnWatchDemo) {
      this.btnWatchDemo.addEventListener('click', () => {
        this.gameManager.audioManager.init();
        this.startScreen.classList.add('hidden');
        this.gameUi.classList.remove('hidden');
        this.gameManager.startDemoMode();
      });
    }

    // Start Showcase Demo from Top Controls
    if (this.btnTopDemo) {
      this.btnTopDemo.addEventListener('click', () => {
        this.gameManager.audioManager.init();
        this.gameManager.startDemoMode();
      });
    }

    // Demo HUD Controls
    if (this.btnDemoPrev) {
      this.btnDemoPrev.addEventListener('click', () => {
        this.gameManager.demoDirector.prevScene();
      });
    }

    if (this.btnDemoPause) {
      this.btnDemoPause.addEventListener('click', () => {
        this.gameManager.demoDirector.togglePause();
      });
    }

    if (this.btnDemoNext) {
      this.btnDemoNext.addEventListener('click', () => {
        this.gameManager.demoDirector.nextScene();
      });
    }

    if (this.btnDemoExit) {
      this.btnDemoExit.addEventListener('click', () => {
        this.gameManager.stopDemoMode();
      });
    }

    // Continue race button after Doctor Octopus ambush
    if (this.btnContinueRace) {
      this.btnContinueRace.addEventListener('click', () => {
        if (this.ambushModal) this.ambushModal.classList.add('hidden');
        if (this.onAmbushDismiss) {
          const cb = this.onAmbushDismiss;
          this.onAmbushDismiss = null;
          cb();
        }
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
        const modeLabel = this.selectedMaxTiles === 60 ? 'Quick (60 Tiles)' : 'Classic (100 Tiles)';
        if (confirm(`Start a brand new match (${this.selectedPlayerCount}P, ${modeLabel})? Board will re-randomize.`)) {
          this.updateSidePanelTarget();
          this.gameManager.startNewMatch(this.selectedPlayerCount, this.selectedMaxTiles);
        }
      });
    }

    // Play Again button on Reveal Screen
    if (this.btnPlayAgain) {
      this.btnPlayAgain.addEventListener('click', () => {
        this.revealScreen.classList.add('hidden');
        this.updateSidePanelTarget();
        this.gameManager.startNewMatch(this.selectedPlayerCount, this.selectedMaxTiles);
      });
    }
  }

  // Render leaderboard side panel
  renderPlayersList(players, currentActiveIndex) {
    if (!this.playersList) return;
    this.playersList.innerHTML = '';

    const maxTiles = this.gameManager?.maxTiles || this.selectedMaxTiles || 100;

    players.forEach((player, idx) => {
      const card = document.createElement('div');
      const isActive = idx === currentActiveIndex;
      card.className = `player-item ${isActive ? 'active-turn' : ''} ${player.isEliminated ? 'eliminated' : ''}`;
      card.title = `Click to focus camera on ${player.config.name}`;

      const progress = Math.min(100, Math.max(1, Math.round((player.currentTile / maxTiles) * 100)));

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
          <span class="player-status-tag ${player.isEliminated ? 'tag-captured' : ''}">${player.isEliminated ? '🐙 CAPTURED' : player.config.hairName}</span>
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
    if (!player) return;
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

  // Show Alert Notice when 1st Player is captured by Doctor Octopus
  showTrapAmbushedNotice(capturedPlayer, remainingActive, onDismiss) {
    this.onAmbushDismiss = onDismiss;
    const maxTiles = this.gameManager?.maxTiles || this.selectedMaxTiles || 100;

    const titleEl = document.getElementById('ambush-title');
    const descEl = document.getElementById('ambush-desc');
    const cardEl = document.getElementById('ambush-captured-card');

    if (titleEl) {
      titleEl.textContent = `${capturedPlayer.config.name} WAS CAPTURED!`;
    }

    if (descEl) {
      const remainingNames = remainingActive.map(p => p.config.name).join(', ');
      descEl.innerHTML = `
        Doctor Octopus sprang his trap and dragged ${capturedPlayer.config.name} into the skyline!<br><br>
        <span class="ambush-highlight">⚡ THE TRAP IS GONE! THE NEXT RACER TO REACH TILE ${maxTiles} WINS!</span><br>
        <small style="color: #94a3b8; font-size: 0.9rem; margin-top: 8px; display: inline-block;">Active Racers Remaining: <strong>${remainingNames}</strong></small>
      `;
    }

    if (cardEl) {
      cardEl.innerHTML = `
        <div class="player-avatar-mini" style="background-color: ${capturedPlayer.config.hex}; width: 44px; height: 44px; font-size: 1.2rem;">
          ${capturedPlayer.config.id}
        </div>
        <div style="text-align: left;">
          <h4 style="color: #fff; font-family: var(--font-display); font-size: 1.4rem;">${capturedPlayer.config.name}</h4>
          <p style="color: #ef4444; font-size: 0.85rem; font-weight: 700;">AMBUSHED AT TILE ${maxTiles} — OUT OF RACE</p>
        </div>
      `;
    }

    if (this.ambushModal) {
      this.ambushModal.classList.remove('hidden');
    }

    // Auto dismiss after 4.5s if player doesn't click
    setTimeout(() => {
      if (this.ambushModal && !this.ambushModal.classList.contains('hidden')) {
        this.ambushModal.classList.add('hidden');
        if (this.onAmbushDismiss) {
          const cb = this.onAmbushDismiss;
          this.onAmbushDismiss = null;
          cb();
        }
      }
    }, 4500);
  }

  // Show Victory Screen when 2nd Player reaches Goal Tile
  showVictory(winnerPlayer, capturedPlayer) {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    const maxTiles = this.gameManager?.maxTiles || this.selectedMaxTiles || 100;
    const titleEl = document.getElementById('reveal-title');
    const subtitleEl = document.getElementById('reveal-subtitle');
    const playerCardEl = document.getElementById('reveal-player-card');
    const badgeEl = document.getElementById('reveal-badge');
    const playAgainBtn = document.getElementById('btn-play-again');

    if (badgeEl) {
      badgeEl.textContent = '🏆 MULTIVERSE CHAMPION!';
      badgeEl.style.backgroundColor = '#16a34a';
    }

    if (titleEl) {
      titleEl.className = 'reveal-title win';
      titleEl.textContent = `${winnerPlayer.config.name} WINS!`;
      titleEl.style.color = '#facc15';
    }

    if (subtitleEl) {
      const extra = capturedPlayer
        ? `While ${capturedPlayer.config.name} fell into Doctor Octopus's ambush trap, ${winnerPlayer.config.name} reached Tile ${maxTiles} second and conquered the Multiverse!`
        : `Conquered the ${maxTiles}-tile Multiverse race!`;
      subtitleEl.innerHTML = `<strong style="color: #fde047; font-size: 1.25rem;">VICTORY ACHIEVED!</strong><br><br>${extra}`;
    }

    if (playerCardEl) {
      playerCardEl.innerHTML = `
        <div class="player-avatar-mini" style="background-color: ${winnerPlayer.config.hex}; width: 56px; height: 56px; font-size: 1.5rem;">
          ${winnerPlayer.config.id}
        </div>
        <div>
          <h3 style="color: #fff; font-family: var(--font-display); font-size: 2rem;">${winnerPlayer.config.name}</h3>
          <p style="color: #4ade80; font-weight: 800;">MULTIVERSE WINNER — REACHED TILE ${maxTiles}</p>
        </div>
      `;
    }

    if (playAgainBtn) {
      playAgainBtn.textContent = 'PLAY AGAIN';
    }

    if (this.revealScreen) {
      this.revealScreen.classList.remove('hidden');
    }
  }

  // Show Doctor Octopus Trap Defeat Screen (Fallback if all racers are eliminated)
  showTrapDefeat(player) {
    const maxTiles = this.gameManager?.maxTiles || this.selectedMaxTiles || 100;
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
      subtitleEl.innerHTML = `<strong style="color: #fca5a5; font-size: 1.25rem;">You fell right into their trap.</strong><br><br>${player.config.name} reached Tile ${maxTiles}! Doctor Octopus's mechanical arms grabbed her and leaped away across the skyline toward an unknown destination...`;
    }

    if (playerCardEl) {
      playerCardEl.innerHTML = `
        <div class="player-avatar-mini" style="background-color: ${player.config.hex}; width: 48px; height: 48px; font-size: 1.3rem;">
          ${player.config.id}
        </div>
        <div>
          <h3 style="color: #fff; font-family: var(--font-display); font-size: 1.8rem;">${player.config.name}</h3>
          <p style="color: #ef4444; font-weight: 700;">CAPTURED AT TILE ${maxTiles} — DEFEATED</p>
        </div>
      `;
    }

    if (this.revealScreen) {
      this.revealScreen.classList.remove('hidden');
    }
  }
}
