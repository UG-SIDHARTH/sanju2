import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const p = spawn(edgePath, [
  '--headless',
  '--remote-debugging-port=9223',
  '--user-data-dir=d:\\temp_edge_diag',
  'http://localhost:9000/'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9223/json');
  const tabs = await res.json();
  const gameTab = tabs.find(t => t.url.includes('9000'));
  if (!gameTab) {
    console.error('Game tab not found');
    p.kill();
    return;
  }

  const ws = new WebSocket(gameTab.webSocketDebuggerUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Console.messageAdded') {
        console.log('CONSOLE:', msg.params.message.text);
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error('EXCEPTION:', JSON.stringify(msg.params.exceptionDetails));
      }
      if (msg.id && msg.result) {
        console.log(`RESULT id=${msg.id}:`, msg.result.result?.value);
      }
    };

    // Check initial state
    setTimeout(() => {
      console.log('--- Initial State ---');
      ws.send(JSON.stringify({
        id: 3,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (() => {
              const startScreen = document.getElementById('start-screen');
              const startScreenHidden = startScreen?.classList.contains('hidden');
              const tabLocalActive = document.getElementById('tab-local')?.classList.contains('active');
              const tabOnlineActive = document.getElementById('tab-online')?.classList.contains('active');
              const btnStart = document.getElementById('btn-start-game');
              return JSON.stringify({
                startScreenHidden,
                tabLocalActive,
                tabOnlineActive,
                btnStartVisible: btnStart ? (btnStart.offsetWidth > 0 && btnStart.offsetHeight > 0) : false,
                btnStartDisplay: btnStart?.style.display
              });
            })()
          `
        }
      }));
    }, 1000);

    // Click Start Game
    setTimeout(() => {
      console.log('--- Clicking Start Game ---');
      ws.send(JSON.stringify({
        id: 4,
        method: 'Runtime.evaluate',
        params: { expression: `document.getElementById('btn-start-game').click(); 'clicked start'` }
      }));
    }, 2000);

    // Check game state after start
    setTimeout(() => {
      console.log('--- Game State after Start ---');
      ws.send(JSON.stringify({
        id: 5,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (() => {
              const rollBtn = document.getElementById('btn-roll-dice');
              const p1 = document.getElementById('current-player-name')?.textContent;
              const playersCount = document.querySelectorAll('.player-item').length;
              return JSON.stringify({
                rollBtnDisabled: rollBtn?.disabled,
                rollBtnDisplay: rollBtn ? window.getComputedStyle(rollBtn).display : null,
                rollBtnVisibility: rollBtn ? window.getComputedStyle(rollBtn).visibility : null,
                activePlayer: p1,
                playersCount
              });
            })()
          `
        }
      }));
    }, 3000);

    // Roll dice for Player 1
    setTimeout(() => {
      console.log('--- Rolling Dice for Player 1 ---');
      ws.send(JSON.stringify({
        id: 6,
        method: 'Runtime.evaluate',
        params: { expression: `document.getElementById('btn-roll-dice').click(); 'p1 rolled'` }
      }));
    }, 4000);

    // Wait 5s for P1 to move and check turn 2
    setTimeout(() => {
      console.log('--- Turn 2 State ---');
      ws.send(JSON.stringify({
        id: 7,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (() => {
              const rollBtn = document.getElementById('btn-roll-dice');
              const activePlayer = document.getElementById('current-player-name')?.textContent;
              const tile = document.getElementById('current-player-tile')?.textContent;
              const ticker = document.getElementById('action-ticker')?.textContent;
              const turnLabel = document.querySelector('.turn-label')?.textContent;
              return JSON.stringify({
                activePlayer,
                tile,
                rollBtnDisabled: rollBtn?.disabled,
                ticker,
                turnLabel
              });
            })()
          `
        }
      }));
    }, 9500);

    // Try roll for Player 2
    setTimeout(() => {
      console.log('--- Rolling Dice for Player 2 ---');
      ws.send(JSON.stringify({
        id: 8,
        method: 'Runtime.evaluate',
        params: { expression: `document.getElementById('btn-roll-dice').click(); 'p2 rolled'` }
      }));
    }, 10500);

    // Wait and check turn 3 state
    setTimeout(() => {
      console.log('--- Turn 3 State ---');
      ws.send(JSON.stringify({
        id: 9,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (() => {
              const rollBtn = document.getElementById('btn-roll-dice');
              const activePlayer = document.getElementById('current-player-name')?.textContent;
              const tile = document.getElementById('current-player-tile')?.textContent;
              const ticker = document.getElementById('action-ticker')?.textContent;
              return JSON.stringify({
                activePlayer,
                tile,
                rollBtnDisabled: rollBtn?.disabled,
                ticker
              });
            })()
          `
        }
      }));
    }, 15000);

    setTimeout(() => {
      ws.close();
      p.kill();
      process.exit(0);
    }, 16000);
  };
}

run().catch(err => {
  console.error(err);
  p.kill();
  process.exit(1);
});
