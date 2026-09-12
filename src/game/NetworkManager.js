// ==========================================================================
// NETWORK MANAGER - WebRTC Peer-to-Peer Real-Time Online Multiplayer
// Play with a friend across devices with a 6-character Room Code or Instant URL
// ==========================================================================

import Peer from 'peerjs';

export const NET_MODES = {
  LOCAL: 'local',
  HOST: 'host',
  CLIENT: 'client'
};

export class NetworkManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.peer = null;
    this.conn = null;
    this.mode = NET_MODES.LOCAL;
    this.roomCode = null;
    this.myPlayerIndex = 0; // Host is Player 0 (MJ-1), Client is Player 1 (MJ-2)
    this.isConnected = false;

    this.onStatusChange = null;
    this.onOpponentJoined = null;
  }

  isOnline() {
    return this.mode !== NET_MODES.LOCAL && this.isConnected && this.conn && this.conn.open;
  }

  isMyTurn(activePlayerIndex) {
    // If not actively connected to a remote peer, this device plays both players locally!
    if (!this.isOnline()) return true;
    return this.myPlayerIndex === activePlayerIndex;
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'SPY-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  getPeerIdFromRoomCode(code) {
    return `spidey-snakes-${code.toLowerCase().trim().replace(/[^a-z0-9]/g, '')}`;
  }

  // --- HOST A NEW GAME ---
  hostGame(onReady, onPeerConnect) {
    this.disconnect();
    this.mode = NET_MODES.HOST;
    this.myPlayerIndex = 0; // Host is MJ-1
    this.roomCode = this.generateRoomCode();
    const peerId = this.getPeerIdFromRoomCode(this.roomCode);

    try {
      this.peer = new Peer(peerId, {
        debug: 1
      });

      this.peer.on('open', (id) => {
        console.log('[Network] PeerJS Host opened with ID:', id);
        if (onReady && this.mode === NET_MODES.HOST) onReady(this.roomCode);
      });

      this.peer.on('connection', (conn) => {
        console.log('[Network] Opponent connected to room!');
        if (this.mode === NET_MODES.HOST) {
          this.setupConnection(conn, onPeerConnect);
        }
      });

      this.peer.on('error', (err) => {
        console.error('[Network] Host PeerJS error:', err);
        // If room code already taken, regenerate and retry only if still in host mode
        if (err.type === 'unavailable-id' && this.mode === NET_MODES.HOST) {
          setTimeout(() => {
            if (this.mode === NET_MODES.HOST) {
              this.hostGame(onReady, onPeerConnect);
            }
          }, 400);
        }
      });
    } catch (e) {
      console.error('[Network] Failed to initialize host peer:', e);
    }
  }

  // --- JOIN AN EXISTING ROOM ---
  joinGame(roomCode, onConnectSuccess, onConnectError) {
    this.disconnect();
    this.mode = NET_MODES.CLIENT;
    this.myPlayerIndex = 1; // Client is MJ-2
    this.roomCode = roomCode.toUpperCase().trim();
    const targetPeerId = this.getPeerIdFromRoomCode(this.roomCode);

    try {
      this.peer = new Peer({
        debug: 1
      });

      this.peer.on('open', () => {
        console.log('[Network] PeerJS Client opened. Connecting to target:', targetPeerId);
        const conn = this.peer.connect(targetPeerId, {
          reliable: true
        });

        this.setupConnection(conn, onConnectSuccess);
      });

      this.peer.on('error', (err) => {
        console.error('[Network] Join PeerJS error:', err);
        if (onConnectError) onConnectError(err);
      });
    } catch (e) {
      console.error('[Network] Failed to connect to host:', e);
      if (onConnectError) onConnectError(e);
    }
  }

  setupConnection(conn, onReadyCallback) {
    this.conn = conn;

    this.conn.on('open', () => {
      this.isConnected = true;
      console.log('[Network] WebRTC DataChannel OPEN! Connected with opponent.');

      if (this.mode === NET_MODES.HOST) {
        // Send initial match sync packet (seed, randomized tiles)
        this.sendMatchSync();
      }

      if (onReadyCallback) onReadyCallback();
    });

    this.conn.on('data', (data) => {
      this.handleIncomingData(data);
    });

    this.conn.on('close', () => {
      this.isConnected = false;
      console.warn('[Network] Opponent disconnected.');
      if (this.onStatusChange) {
        this.onStatusChange('Opponent disconnected from the match.');
      }
    });

    this.conn.on('error', (err) => {
      console.error('[Network] DataChannel error:', err);
    });
  }

  // --- SEND PACKETS ---
  send(type, payload = {}) {
    if (this.conn && this.isConnected) {
      try {
        this.conn.send({ type, payload });
      } catch (e) {
        console.error('[Network] Send error:', e);
      }
    }
  }

  sendMatchSync() {
    if (this.mode !== NET_MODES.HOST) return;

    this.send('MATCH_SYNC', {
      spiderMen: this.gameManager.spideyConfig,
      goblins: this.gameManager.goblinConfig,
      portals: this.gameManager.portalConfigs,
      activePlayerIndex: this.gameManager.activePlayerIndex
    });
  }

  sendDiceRoll(diceVal) {
    this.send('DICE_ROLL', {
      diceRoll: diceVal,
      playerIndex: this.myPlayerIndex
    });
  }

  sendReaction(emojiText) {
    this.send('REACTION', {
      playerIndex: this.myPlayerIndex,
      emoji: emojiText
    });
  }

  // --- RECEIVE & DISPATCH INCOMING PACKETS ---
  handleIncomingData(packet) {
    if (!packet || !packet.type) return;

    const { type, payload } = packet;

    switch (type) {
      case 'MATCH_SYNC':
        console.log('[Network] Received MATCH_SYNC from Host:', payload);
        if (this.mode === NET_MODES.CLIENT) {
          this.gameManager.applyRemoteMatchSync(payload);
        }
        break;

      case 'DICE_ROLL':
        console.log('[Network] Received Remote DICE_ROLL:', payload);
        this.gameManager.applyRemoteDiceRoll(payload.diceRoll, payload.playerIndex);
        break;

      case 'REACTION':
        if (this.gameManager.comicFX) {
          const player = this.gameManager.players[payload.playerIndex];
          if (player) {
            this.gameManager.comicFX.spawnAt(
              player.root.position,
              payload.emoji,
              '#3b82f6',
              '#ffffff',
              2.0
            );
          }
        }
        break;

      default:
        console.log('[Network] Unknown packet type:', type);
    }
  }

  disconnect() {
    if (this.conn) {
      try { this.conn.close(); } catch (e) {}
      this.conn = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
    }
    this.mode = NET_MODES.LOCAL;
    this.isConnected = false;
    this.roomCode = null;
  }
}
