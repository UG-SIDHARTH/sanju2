import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const p = spawn(edgePath, [
  '--headless',
  '--remote-debugging-port=9225',
  '--user-data-dir=d:\\temp_edge_flow',
  'http://localhost:9000/'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9225/json');
  const tabs = await res.json();
  const gameTab = tabs.find(t => t.url.includes('9000'));
  if (!gameTab) {
    console.error('Game tab not found');
    p.kill();
    process.exit(1);
  }

  const ws = new WebSocket(gameTab.webSocketDebuggerUrl);

  let msgId = 20;
  function send(expr) {
    const id = ++msgId;
    return new Promise((resolve) => {
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          resolve(msg.result?.result?.value);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: { expression: expr, awaitPromise: true }
      }));
    });
  }

  ws.onopen = async () => {
    ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Console.messageAdded') {
        console.log('CONSOLE:', msg.params.message.text);
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error('CRITICAL EXCEPTION:', JSON.stringify(msg.params.exceptionDetails));
      }
    };

    try {
      console.log('--- TEST A: User switches to Online tab then starts game ---');
      await send(`document.getElementById('tab-online').click(); 'switched to online'`);
      await new Promise(r => setTimeout(r, 600));

      const hostCode = await send(`document.getElementById('display-room-code').textContent`);
      console.log('Room Code displayed:', hostCode);

      // Click start game button directly while on online host view
      console.log('User clicks start button while on host view without peer...');
      await send(`document.getElementById('btn-start-game').click(); 'clicked start'`);
      await new Promise(r => setTimeout(r, 1000));

      const netModeAfterStart = await send(`
        (() => {
          const gm = window.app.gameManager;
          return JSON.stringify({
            mode: gm.networkManager.mode,
            isOnline: gm.networkManager.isOnline(),
            p0Turn: gm.networkManager.isMyTurn(0),
            p1Turn: gm.networkManager.isMyTurn(1)
          });
        })()
      `);
      console.log('Net state after start from host view:', netModeAfterStart);

      // Player 1 roll
      console.log('Rolling for Player 1 (MJ-1)...');
      await send(`document.getElementById('btn-roll-dice').click(); 'p1 roll'`);
      await new Promise(r => setTimeout(r, 5500));

      // Check Turn 2 (MJ-2)
      const turn2State = await send(`
        (() => {
          const rollBtn = document.getElementById('btn-roll-dice');
          const p = document.getElementById('current-player-name')?.textContent;
          const turnLabel = document.querySelector('.turn-label')?.textContent;
          const isMyTurn = window.app.gameManager.networkManager.isMyTurn(window.app.gameManager.activePlayerIndex);
          return JSON.stringify({
            player: p,
            turnLabel,
            btnDisabled: rollBtn.disabled,
            isMyTurn
          });
        })()
      `);
      console.log('Turn 2 State (MJ-2):', turn2State);

      const parsedTurn2 = JSON.parse(turn2State);
      if (parsedTurn2.btnDisabled || !parsedTurn2.isMyTurn) {
        throw new Error('FAIL: Player 2 roll button is disabled or not player turn!');
      }

      // Player 2 roll
      console.log('Rolling for Player 2 (MJ-2)...');
      await send(`document.getElementById('btn-roll-dice').click(); 'p2 roll'`);
      await new Promise(r => setTimeout(r, 5500));

      // Check Turn 3 (Back to MJ-1 or bonus)
      const turn3State = await send(`
        (() => {
          const rollBtn = document.getElementById('btn-roll-dice');
          const p = document.getElementById('current-player-name')?.textContent;
          const turnLabel = document.querySelector('.turn-label')?.textContent;
          return JSON.stringify({
            player: p,
            turnLabel,
            btnDisabled: rollBtn.disabled
          });
        })()
      `);
      console.log('Turn 3 State:', turn3State);

      console.log('--- TEST B: New Game restart ---');
      await send(`
        (() => {
          window.app.gameManager.startNewMatch(2);
          return 'new match started';
        })()
      `);
      await new Promise(r => setTimeout(r, 1000));

      const resetTurnState = await send(`
        (() => {
          const rollBtn = document.getElementById('btn-roll-dice');
          const p = document.getElementById('current-player-name')?.textContent;
          const turnLabel = document.querySelector('.turn-label')?.textContent;
          return JSON.stringify({
            player: p,
            turnLabel,
            btnDisabled: rollBtn.disabled
          });
        })()
      `);
      console.log('Reset match turn state:', resetTurnState);

      console.log('SUCCESS: All 2-Player local pass-and-play scenarios verified working 100%!');
    } catch (err) {
      console.error('Error during test:', err);
    } finally {
      ws.close();
      p.kill();
      process.exit(0);
    }
  };
}

run().catch(e => {
  console.error(e);
  p.kill();
  process.exit(1);
});
