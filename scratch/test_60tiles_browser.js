import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = 'd:\\temp_edge_60tiles';

const p = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9225',
  `--user-data-dir=${userDataDir}`,
  '--window-size=1280,720',
  'http://localhost:9000/'
]);

p.on('error', (err) => {
  console.error('Failed to spawn edge:', err);
  process.exit(1);
});

async function run() {
  console.log('Waiting for Edge CDP to be ready...');
  let tabs = null;
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 600));
    try {
      const res = await fetch('http://127.0.0.1:9225/json');
      tabs = await res.json();
      if (tabs && tabs.length > 0) break;
    } catch (e) {}
  }

  if (!tabs) {
    console.error('Failed to connect to CDP endpoint');
    p.kill();
    process.exit(1);
  }

  const gameTab = tabs.find(t => t.url.includes('9000')) || tabs[0];
  console.log('Attaching to tab:', gameTab.url);

  const ws = new WebSocket(gameTab.webSocketDebuggerUrl);

  let msgId = 1;
  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      const handler = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  ws.onopen = async () => {
    try {
      await send('Runtime.enable');
      await send('Page.enable');

      console.log('Waiting for page to initialize...');
      await new Promise(r => setTimeout(r, 2000));

      // 1. Select 60 Tiles Quick Mode and Start Game
      const startResult = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const btn60 = document.querySelector('.game-mode-btn[data-tiles="60"]');
            if (btn60) btn60.click();
            const btnStart = document.getElementById('btn-start-game');
            if (btnStart) btnStart.click();
            return {
              maxTilesSelected: window.app?.hud?.selectedMaxTiles,
              activeMode: window.app?.gameManager?.maxTiles
            };
          })()
        `,
        returnByValue: true
      });
      console.log('Start match evaluation:', startResult.result.value);

      // Wait 1.2 second for game entities & camera to settle
      await new Promise(r => setTimeout(r, 1200));

      // 2. Comprehensive Diagnostics of UI and 3D Board
      const diagResult = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const demoHud = document.getElementById('demo-hud');
            const turnExtraMsg = document.getElementById('turn-extra-msg');
            const sidePanel = document.querySelector('.side-panel');
            const turnCard = document.getElementById('turn-card');
            const gm = window.app?.gameManager;
            const board = window.app?.board;
            const cam = gm?.cameraDirector;

            const demoHudDisplay = window.getComputedStyle(demoHud).display;
            const turnExtraDisplay = window.getComputedStyle(turnExtraMsg).display;
            const sidePanelDisplay = window.getComputedStyle(sidePanel).display;
            const turnCardDisplay = window.getComputedStyle(turnCard).display;

            // Check tile visibility
            const tile60Vis = board?.tiles[60]?.mesh?.visible;
            const tile61Vis = board?.tiles[61]?.mesh?.visible;
            const tile75Vis = board?.tiles[75]?.mesh?.visible;
            const tile100Vis = board?.tiles[100]?.mesh?.visible;

            // Check platform dimensions
            const baseScaleZ = board?.baseMesh?.scale?.z;
            const basePosZ = board?.baseMesh?.position?.z;

            // Check camera center
            const camLookAtZ = cam?.targetLookAt?.z;
            const camPosZ = cam?.targetPosition?.z;

            // Check players
            const players = gm?.players?.map(p => ({
              name: p.config.name,
              tile: p.currentTile,
              visible: p.root?.visible
            }));

            return {
              demoHudDisplay,
              turnExtraDisplay,
              sidePanelDisplay,
              turnCardDisplay,
              tile60Vis,
              tile61Vis,
              tile75Vis,
              tile100Vis,
              baseScaleZ,
              basePosZ,
              camLookAtZ,
              camPosZ,
              gmMaxTiles: gm?.maxTiles,
              boardMaxTiles: board?.maxTiles,
              players
            };
          })()
        `,
        returnByValue: true
      });

      const diag = diagResult.result.value;
      console.log('--- 60 TILES MODE VERIFICATION ---');
      console.log('Demo HUD computed display:', diag.demoHudDisplay, diag.demoHudDisplay === 'none' ? '✅ PASS' : '❌ FAIL');
      console.log('Bonus msg computed display:', diag.turnExtraDisplay, diag.turnExtraDisplay === 'none' ? '✅ PASS' : '❌ FAIL');
      console.log('Side panel computed display:', diag.sidePanelDisplay, diag.sidePanelDisplay !== 'none' ? '✅ PASS' : '❌ FAIL');
      console.log('Turn card computed display:', diag.turnCardDisplay, diag.turnCardDisplay !== 'none' ? '✅ PASS' : '❌ FAIL');
      console.log('Tile 60 visible:', diag.tile60Vis, diag.tile60Vis === true ? '✅ PASS' : '❌ FAIL');
      console.log('Tile 61 visible:', diag.tile61Vis, diag.tile61Vis === false ? '✅ PASS' : '❌ FAIL');
      console.log('Tile 75 visible:', diag.tile75Vis, diag.tile75Vis === false ? '✅ PASS' : '❌ FAIL');
      console.log('Tile 100 visible:', diag.tile100Vis, diag.tile100Vis === false ? '✅ PASS' : '❌ FAIL');
      console.log('Base platform Scale Z:', diag.baseScaleZ, diag.baseScaleZ === 0.6 ? '✅ PASS' : '❌ FAIL');
      console.log('Base platform Pos Z:', diag.basePosZ, Math.abs(diag.basePosZ - 6.04) < 0.05 ? '✅ PASS' : '❌ FAIL');
      console.log('Camera targetLookAt Z:', diag.camLookAtZ, Math.abs(diag.camLookAtZ - 6.04) < 0.05 ? '✅ PASS' : '❌ FAIL');
      console.log('GM maxTiles:', diag.gmMaxTiles, diag.gmMaxTiles === 60 ? '✅ PASS' : '❌ FAIL');
      console.log('Board maxTiles:', diag.boardMaxTiles, diag.boardMaxTiles === 60 ? '✅ PASS' : '❌ FAIL');

      // 3. Take screenshot
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const outDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\1051f95e-f2d2-4edc-a568-a6977f3071ff';
      const shotPath = path.join(outDir, 'screenshot_60tiles_verified.png');
      fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
      console.log('Saved screenshot to:', shotPath);

      const allPassed = (
        diag.demoHudDisplay === 'none' &&
        diag.turnExtraDisplay === 'none' &&
        diag.sidePanelDisplay !== 'none' &&
        diag.turnCardDisplay !== 'none' &&
        diag.tile60Vis === true &&
        diag.tile61Vis === false &&
        diag.tile100Vis === false &&
        diag.gmMaxTiles === 60 &&
        Math.abs(diag.camLookAtZ - 6.04) < 0.05
      );

      if (allPassed) {
        console.log('>>> ALL 60-TILES ACCEPTANCE CRITERIA PASSED 100% <<<');
      } else {
        console.error('>>> SOME ACCEPTANCE CRITERIA FAILED <<<');
      }

      ws.close();
      p.kill();
      process.exit(allPassed ? 0 : 1);
    } catch (err) {
      console.error('Test execution error:', err);
      ws.close();
      p.kill();
      process.exit(1);
    }
  };
}

run();
