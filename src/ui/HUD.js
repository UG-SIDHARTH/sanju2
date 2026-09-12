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

    this.btnTurboMode = document.getElementById('btn-turbo-mode');
    this.btnCameraMode = document.getElementById('btn-camera-mode');
    this.btnSoundToggle = document.getElementById('btn-sound-toggle');
    this.btnRules = document.getElementById('btn-rules');
    this.btnCloseRules = document.getElementById('btn-close-rules');
    this.btnOkRules = document.getElementById('btn-ok-rules');
    this.btnNewMatch = document.getElementById('btn-new-match');
    this.btnStartGame = document.getElementById('btn-start-game');
    this.btnPlayAgain = document.getElementById('btn-play-again');

    this.btnZoomIn = document.getElementById('btn-zoom-in');
    this.btnZoomReset = document.getElementById('btn-zoom-reset');
    this.btnZoomOut = document.getElementById('btn-zoom-out');

    this.selectedPlayerCount = 2; // Exclusively 2 players

    // Online Multiplayer DOM Elements
    this.tabLocal = document.getElementById('tab-local');
    this.tabOnline = document.getElementById('tab-online');
    this.localInfoBox = document.getElementById('local-info-box');
    this.btnStartText = document.getElementById('btn-start-text');
    this.onlineLobbyPanel = document.getElementById('online-lobby-panel');
    this.btnNetHost = document.getElementById('btn-net-host');
    this.btnNetJoinTab = document.getElementById('btn-net-join-tab');
    this.netHostView = document.getElementById('net-host-view');
    this.netJoinView = document.getElementById('net-join-view');
    this.displayRoomCode = document.getElementById('display-room-code');
    this.btnCopyCode = document.getElementById('btn-copy-code');
    this.btnCopyLink = document.getElementById('btn-copy-link');
    this.inputRoomCode = document.getElementById('input-room-code');
    this.btnNetConnect = document.getElementById('btn-net-connect');
    this.btnCancelOnline = document.getElementById('btn-cancel-online');
    this.btnCancelOnlineJoin = document.getElementById('btn-cancel-online-join');
    this.hostStatusMsg = document.getElementById('host-status-msg');
    this.joinStatusMsg = document.getElementById('join-status-msg');

    this.setupListeners();
    this.checkUrlRoomParam();
  }

  checkUrlRoomParam() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam && this.inputRoomCode) {
        this.inputRoomCode.value = roomParam.toUpperCase().trim();
        // Automatically open online join tab
        this.switchModeTab('online');
        this.switchNetTab('join');
        if (this.joinStatusMsg) {
          this.joinStatusMsg.textContent = `Room ${roomParam.toUpperCase()} detected! Click CONNECT & PLAY to join your friend.`;
        }
      }
    } catch (e) {}
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
        this.logEvent(isTurbo ? '⚡ Turbo Speed ON! Super fast steps & warps.' : '⚡ Turbo Speed OFF.');
      });
    }

    // Zoom buttons
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

    // --- MODE TABS: LOCAL VS ONLINE MULTIPLAYER ---
    if (this.tabLocal) {
      this.tabLocal.addEventListener('click', () => this.switchModeTab('local'));
    }
    if (this.tabOnline) {
      this.tabOnline.addEventListener('click', () => this.switchModeTab('online'));
    }

    if (this.btnNetHost) {
      this.btnNetHost.addEventListener('click', () => this.switchNetTab('host'));
    }
    if (this.btnNetJoinTab) {
      this.btnNetJoinTab.addEventListener('click', () => this.switchNetTab('join'));
    }

    // Host: Copy Code & Copy Link
    if (this.btnCopyCode) {
      this.btnCopyCode.addEventListener('click', () => {
        const code = this.displayRoomCode.textContent;
        if (code && code !== 'CREATING...') {
          navigator.clipboard.writeText(code);
          this.btnCopyCode.textContent = '✅ Copied!';
          setTimeout(() => { this.btnCopyCode.textContent = '📋 Copy Code'; }, 2000);
        }
      });
    }

    if (this.btnCopyLink) {
      this.btnCopyLink.addEventListener('click', () => {
        const code = this.displayRoomCode.textContent;
        if (code && code !== 'CREATING...') {
          const shareUrl = `${window.location.origin}${window.location.pathname}?room=${code}`;
          navigator.clipboard.writeText(shareUrl);
          this.btnCopyLink.textContent = '✅ Link Copied!';
          setTimeout(() => { this.btnCopyLink.textContent = '🔗 Copy Invite Link'; }, 2000);
        }
      });
    }

    // Join Room Connect Button
    if (this.btnNetConnect) {
      this.btnNetConnect.addEventListener('click', () => {
        const code = this.inputRoomCode.value.trim().toUpperCase();
        if (!code) {
          if (this.joinStatusMsg) this.joinStatusMsg.textContent = '⚠️ Please enter a room code!';
          return;
        }

        if (this.joinStatusMsg) this.joinStatusMsg.textContent = `Connecting to room ${code}...`;
        this.btnNetConnect.disabled = true;

        this.gameManager.networkManager.joinGame(
          code,
          // onConnectSuccess:
          () => {
            if (this.joinStatusMsg) this.joinStatusMsg.textContent = '🎉 Connected to friend! Launching game...';
            this.gameManager.audioManager.init();

            setTimeout(() => {
              this.startScreen.classList.add('hidden');
              this.gameUi.classList.remove('hidden');
              this.gameManager.startNewMatch(2);
            }, 600);
          },
          // onConnectError:
          (err) => {
            this.btnNetConnect.disabled = false;
            if (this.joinStatusMsg) {
              this.joinStatusMsg.textContent = '❌ Failed to connect. Check room code and try again.';
            }
          }
        );
      });
    }

    // Cancel / Back to Local 2-Player Buttons
    if (this.btnCancelOnline) {
      this.btnCancelOnline.addEventListener('click', () => this.switchModeTab('local'));
    }
    if (this.btnCancelOnlineJoin) {
      this.btnCancelOnlineJoin.addEventListener('click', () => this.switchModeTab('local'));
    }

    // Start Game (Local or Host)
    this.btnStartGame.addEventListener('click', () => {
      this.gameManager.audioManager.init();

      // If starting game while on the Local tab OR without a connected remote peer, ensure clean local 2-player mode
      if (!this.gameManager.networkManager.isOnline()) {
        this.gameManager.networkManager.disconnect();
      }

      this.startScreen.classList.add('hidden');
      this.gameUi.classList.remove('hidden');
      this.gameManager.startNewMatch(2);
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
      if (confirm('Start a brand new match? Board will re-randomize.')) {
        if (!this.gameManager.networkManager.isOnline()) {
          this.gameManager.networkManager.disconnect();
        }
        this.gameManager.startNewMatch(2);
      }
    });

    // Play Again button on Reveal Screen
    this.btnPlayAgain.addEventListener('click', () => {
      this.revealScreen.classList.add('hidden');
      this.startScreen.classList.remove('hidden');
      this.gameUi.classList.add('hidden');
      this.switchModeTab('local');
    });
  }

  switchModeTab(mode) {
    if (mode === 'local') {
      this.tabLocal.classList.add('active');
      this.tabOnline.classList.remove('active');
      if (this.localInfoBox) this.localInfoBox.classList.remove('hidden');
      if (this.onlineLobbyPanel) this.onlineLobbyPanel.classList.add('hidden');
      this.gameManager.networkManager.disconnect();
      if (this.btnStartGame) this.btnStartGame.style.display = 'block';
      if (this.btnStartText) this.btnStartText.textContent = 'START 2-PLAYER MATCH';
    } else {
      this.tabOnline.classList.add('active');
      this.tabLocal.classList.remove('active');
      if (this.localInfoBox) this.localInfoBox.classList.add('hidden');
      if (this.onlineLobbyPanel) this.onlineLobbyPanel.classList.remove('hidden');
      this.switchNetTab('host');
    }
  }

  switchNetTab(subTab) {
    if (subTab === 'host') {
      this.btnNetHost.classList.add('active');
      this.btnNetJoinTab.classList.remove('active');
      this.netHostView.classList.remove('hidden');
      this.netJoinView.classList.add('hidden');
      if (this.btnStartGame) this.btnStartGame.style.display = 'block';
      if (this.btnStartText) this.btnStartText.textContent = 'START LOCAL MATCH (OR WAIT FOR FRIEND)';

      // Start host session
      this.displayRoomCode.textContent = 'CREATING...';
      this.gameManager.networkManager.hostGame(
        (code) => {
          this.displayRoomCode.textContent = code;
          if (this.hostStatusMsg) {
            this.hostStatusMsg.innerHTML = `<span class="spinner-dot"></span> Room <strong>${code}</strong> is live! Waiting for friend to join...`;
          }
        },
        () => {
          if (this.hostStatusMsg) {
            this.hostStatusMsg.innerHTML = `🎉 Friend joined! Starting game...`;
          }
          setTimeout(() => {
            this.startScreen.classList.add('hidden');
            this.gameUi.classList.remove('hidden');
            this.gameManager.startNewMatch(2);
          }, 800);
        }
      );
    } else {
      this.btnNetJoinTab.classList.add('active');
      this.btnNetHost.classList.remove('active');
      this.netJoinView.classList.remove('hidden');
      this.netHostView.classList.add('hidden');
      if (this.btnStartGame) this.btnStartGame.style.display = 'none'; // Join flow starts via Connect button
    }
  }

  // Render leaderboard side panel
  renderPlayersList(players, currentActiveIndex) {
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
    this.currentPlayerName.textContent = player.config.name;
    this.currentPlayerTile.textContent = player.currentTile;
    this.currentHairIndicator.style.backgroundColor = player.config.hex;

    const isOnline = this.gameManager.networkManager.isOnline();
    const isMyTurn = this.gameManager.networkManager.isMyTurn(this.gameManager.activePlayerIndex);

    const turnLabelEl = document.querySelector('.turn-label');
    if (turnLabelEl) {
      if (isOnline) {
        turnLabelEl.textContent = isMyTurn ? '🎮 YOUR TURN' : '⏳ OPPONENT\'S TURN';
        turnLabelEl.style.color = isMyTurn ? '#22c55e' : '#f59e0b';
      } else {
        turnLabelEl.textContent = `${player.config.name}'S TURN`;
        turnLabelEl.style.color = player.config.hex;
      }
    }

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

  // Show Secret 100 Climax Reveal Screen
  showSecret100Reveal(player, isWin, onDismiss) {
    const titleEl = document.getElementById('reveal-title');
    const subtitleEl = document.getElementById('reveal-subtitle');
    const playerCardEl = document.getElementById('reveal-player-card');

    titleEl.className = 'reveal-title win';
    titleEl.textContent = '🏆 MULTIVERSE VICTORY!';

    subtitleEl.textContent = `${player.config.name} reached Tile 100, survived Doctor Octopus's throw, and was rescued by Spider-Man after all 6 Spider-Men defeated Doctor Octopus!`;

    playerCardEl.innerHTML = `
      <div class="player-avatar-mini" style="background-color: ${player.config.hex}; width: 48px; height: 48px; font-size: 1.3rem;">
        ${player.config.id}
      </div>
      <div>
        <h3 style="color: #fff; font-family: var(--font-display); font-size: 1.8rem;">${player.config.name}</h3>
        <p style="color: var(--color-gold); font-weight: 700;">WINNER OF THE MULTIVERSE</p>
      </div>
    `;

    this.revealScreen.classList.remove('hidden');

    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      confetti({
        particleCount: 160,
        spread: 110,
        origin: { y: 0.5 }
      });
    }, 500);
  }
}
