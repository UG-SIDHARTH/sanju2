import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const p = spawn(edgePath, [
  '--headless',
  '--remote-debugging-port=9222',
  '--user-data-dir=d:\\temp_edge2',
  'http://localhost:9000/'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9222/json');
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

    // Step 1: Click start game
    setTimeout(() => {
      console.log('--- Step 1: Clicking Start Game ---');
      ws.send(JSON.stringify({
        id: 4,
        method: 'Runtime.evaluate',
        params: { expression: `document.getElementById('btn-start-game').click(); 'started'` }
      }));
    }, 1000);

    // Step 2: Player 1 rolls
    setTimeout(() => {
      console.log('--- Step 2: Player 1 Rolling Dice ---');
      ws.send(JSON.stringify({
        id: 5,
        method: 'Runtime.evaluate',
        params: { expression: `document.getElementById('btn-roll-dice').click(); 'P1 rolled'` }
      }));
    }, 2000);

    // Step 3: Wait 5 seconds for Player 1 to walk and finish turn
    setTimeout(() => {
      console.log('--- Step 3: Checking turn state after P1 move ---');
      ws.send(JSON.stringify({
        id: 6,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (() => {
              const name = document.getElementById('current-player-name')?.textContent;
              const tile = document.getElementById('current-player-tile')?.textContent;
              const rollBtn = document.getElementById('btn-roll-dice');
              const ticker = document.getElementById('action-ticker')?.textContent;
              const turnLabel = document.querySelector('.turn-label')?.textContent;
              return JSON.stringify({
                name,
                tile,
                rollBtnDisabled: rollBtn ? rollBtn.disabled : null,
                turnLabel,
                ticker
              });
            })()
          `
        }
      }));
    }, 7000);

    // Step 4: Try Player 2 rolling
    setTimeout(() => {
      console.log('--- Step 4: Player 2 Rolling Dice ---');
      ws.send(JSON.stringify({
        id: 7,
        method: 'Runtime.evaluate',
        params: { expression: `document.getElementById('btn-roll-dice').click(); 'P2 rolled'` }
      }));
    }, 8000);

    // Step 5: Check if Player 2 is moving
    setTimeout(() => {
      console.log('--- Step 5: Checking turn state after P2 roll ---');
      ws.send(JSON.stringify({
        id: 8,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (() => {
              const name = document.getElementById('current-player-name')?.textContent;
              const tile = document.getElementById('current-player-tile')?.textContent;
              const ticker = document.getElementById('action-ticker')?.textContent;
              return JSON.stringify({ name, tile, ticker });
            })()
          `
        }
      }));
    }, 12000);

    setTimeout(() => {
      p.kill();
      process.exit(0);
    }, 14000);
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled' || msg.method === 'Console.messageAdded' || msg.method === 'Runtime.exceptionThrown') {
      console.log('CONSOLE:', msg.params?.message?.text || msg.params?.args?.[0]?.value || JSON.stringify(msg));
    }
    if (msg.id >= 4) {
      console.log('RESULT id=' + msg.id + ':', msg.result?.result?.value);
    }
  };
}

run();
