import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const p = spawn(edgePath, [
  '--headless',
  '--remote-debugging-port=9224',
  '--user-data-dir=d:\\temp_edge_mech',
  'http://localhost:9000/'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9224/json');
  const tabs = await res.json();
  const gameTab = tabs.find(t => t.url.includes('9000'));
  if (!gameTab) {
    console.error('Game tab not found');
    p.kill();
    process.exit(1);
  }

  const ws = new WebSocket(gameTab.webSocketDebuggerUrl);

  let msgId = 10;
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
      console.log('--- Test 1: Start 2-Player Match ---');
      await send(`document.getElementById('btn-start-game').click(); 'started'`);
      await new Promise(r => setTimeout(r, 1000));

      const gmState = await send(`
        (() => {
          const gm = window.app?.gameManager || window.gameManager;
          return JSON.stringify({
            spideyCount: gm?.spiderMen?.length,
            goblinCount: gm?.greenGoblins?.length,
            portalCount: gm?.portals?.length,
            playersCount: gm?.players?.length,
            netMode: gm?.networkManager?.mode,
            isOnline: gm?.networkManager?.isOnline()
          });
        })()
      `);
      console.log('GM State:', gmState);

      console.log('--- Test 2: Trigger First Spider-Man Ladder ---');
      const spideyResult = await send(`
        new Promise((resolve) => {
          const gm = window.app?.gameManager || window.gameManager;
          const spidey = gm.spiderMen[0];
          const player = gm.players[0];
          console.log('Triggering Spidey on trigger tile:', spidey.triggerTileNumber);
          gm.checkTileEvents(player, spidey.triggerTileNumber, false);
          setTimeout(() => {
            resolve('Player tile after Spidey: ' + player.currentTile);
          }, 3500);
        })
      `);
      console.log('Spidey Result:', spideyResult);

      console.log('--- Test 3: Trigger First Portal Warp ---');
      const portalResult = await send(`
        new Promise((resolve) => {
          const gm = window.app?.gameManager || window.gameManager;
          const portal = gm.portals[0];
          const player = gm.players[0];
          console.log('Triggering Portal on start tile:', portal.startTile);
          gm.checkTileEvents(player, portal.startTile, false);
          setTimeout(() => {
            resolve('Player tile after Portal: ' + player.currentTile);
          }, 3000);
        })
      `);
      console.log('Portal Result:', portalResult);

      console.log('--- Test 4: Trigger First Goblin Hazard ---');
      const goblinResult = await send(`
        new Promise((resolve) => {
          const gm = window.app?.gameManager || window.gameManager;
          const goblin = gm.greenGoblins[0];
          const player = gm.players[0];
          console.log('Triggering Goblin on station tile:', goblin.fixedTileNumber);
          gm.checkTileEvents(player, goblin.fixedTileNumber, false);
          setTimeout(() => {
            resolve('Player tile after Goblin: ' + player.currentTile);
          }, 4500);
        })
      `);
      console.log('Goblin Result:', goblinResult);

      console.log('--- Test 5: Tab Switch to Online and back to Local ---');
      const tabSwitchResult = await send(`
        (() => {
          const hud = window.app?.hud || window.hud;
          hud.switchModeTab('online');
          const modeWhileOnline = hud.gameManager.networkManager.mode;
          hud.switchModeTab('local');
          const modeBackLocal = hud.gameManager.networkManager.mode;
          return JSON.stringify({ modeWhileOnline, modeBackLocal });
        })()
      `);
      console.log('Tab Switch Result:', tabSwitchResult);

      console.log('--- Test 6: Check isMyTurn for both Player 0 and Player 1 ---');
      const turnCheck = await send(`
        (() => {
          const gm = window.app?.gameManager || window.gameManager;
          return JSON.stringify({
            p0Turn: gm.networkManager.isMyTurn(0),
            p1Turn: gm.networkManager.isMyTurn(1)
          });
        })()
      `);
      console.log('Turn check:', turnCheck);

      console.log('ALL TESTS EXECUTED COMPREHENSIVELY.');
    } catch (err) {
      console.error('Test failed with error:', err);
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
