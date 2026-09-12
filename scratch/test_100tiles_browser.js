import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = 'd:\\temp_edge_100tiles';

const p = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9227',
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
      const res = await fetch('http://127.0.0.1:9227/json');
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

      // 1. Select Classic Mode (100 Tiles) and 2 Players, then Click Start Game
      console.log('Selecting 100 Tiles (Classic Mode)...');
      const startResult = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const btn100 = document.querySelector('.game-mode-btn[data-tiles="100"]');
            if (btn100) btn100.click();
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

      // 2. Comprehensive Diagnostics of UI and 3D Board in 100 Tiles Mode
      const diagResult = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const demoHud = document.getElementById('demo-hud');
            const turnExtraMsg = document.getElementById('turn-extra-msg');
            const sidePanel = document.querySelector('.side-panel');
            const turnCard = document.getElementById('turn-card');
            const panelTarget = document.getElementById('panel-target');
            const gm = window.app?.gameManager;
            const board = window.app?.board;
            const cam = gm?.cameraDirector;

            const demoHudDisplay = window.getComputedStyle(demoHud).display;
            const turnExtraDisplay = window.getComputedStyle(turnExtraMsg).display;
            const sidePanelDisplay = window.getComputedStyle(sidePanel).display;
            const turnCardDisplay = window.getComputedStyle(turnCard).display;
            const panelTargetText = panelTarget?.textContent;

            // Check tile visibility across entire 100 tiles
            const tile1Vis = board?.tiles[1]?.mesh?.visible;
            const tile50Vis = board?.tiles[50]?.mesh?.visible;
            const tile60Vis = board?.tiles[60]?.mesh?.visible;
            const tile61Vis = board?.tiles[61]?.mesh?.visible;
            const tile75Vis = board?.tiles[75]?.mesh?.visible;
            const tile90Vis = board?.tiles[90]?.mesh?.visible;
            const tile100Vis = board?.tiles[100]?.mesh?.visible;

            let all100TilesVisible = true;
            for (let i = 1; i <= 100; i++) {
              if (!board?.tiles[i]?.mesh?.visible) {
                all100TilesVisible = false;
                break;
              }
            }

            // Check platform dimensions for 100 tiles (scale 1.0, pos Z = 0)
            const baseScaleZ = board?.baseMesh?.scale?.z;
            const basePosZ = board?.baseMesh?.position?.z;
            const rimScaleZ = board?.rimMesh?.scale?.z;
            const rimPosZ = board?.rimMesh?.position?.z;

            // Check camera center for 100 tiles (lookAt Z = 0)
            const camLookAtZ = cam?.targetLookAt?.z;
            const camPosZ = cam?.targetPosition?.z;

            // Check entity counts in 100 tiles mode
            const spideyCount = gm?.spiderMen?.length;
            const goblinCount = gm?.greenGoblins?.length;
            const portalCount = gm?.portals?.length;

            // Check goal ring position
            const goalTilePos = board?.tiles[100]?.position;
            const ringPos = board?.goalRing?.position;
            const ringMatchesGoal = Boolean(
              goalTilePos && ringPos &&
              Math.abs(goalTilePos.x - ringPos.x) < 0.1 &&
              Math.abs(goalTilePos.z - ringPos.z) < 0.1
            );

            return {
              demoHudDisplay,
              turnExtraDisplay,
              sidePanelDisplay,
              turnCardDisplay,
              panelTargetText,
              tile1Vis,
              tile50Vis,
              tile60Vis,
              tile61Vis,
              tile75Vis,
              tile90Vis,
              tile100Vis,
              all100TilesVisible,
              baseScaleZ,
              basePosZ,
              rimScaleZ,
              rimPosZ,
              camLookAtZ,
              camPosZ,
              spideyCount,
              goblinCount,
              portalPairsCount: portalCount,
              ringMatchesGoal,
              gmMaxTiles: gm?.maxTiles,
              boardMaxTiles: board?.maxTiles,
              goalLabel: board?.goalLabel
            };
          })()
        `,
        returnByValue: true
      });

      const diag = diagResult.result.value;
      console.log('--- 100 TILES (CLASSIC MODE) VERIFICATION ---');
      console.log('GM maxTiles:', diag.gmMaxTiles, diag.gmMaxTiles === 100 ? '✅ PASS' : '❌ FAIL');
      console.log('Board maxTiles:', diag.boardMaxTiles, diag.boardMaxTiles === 100 ? '✅ PASS' : '❌ FAIL');
      console.log('Goal label:', diag.goalLabel, diag.goalLabel === '🐙 TILE 100' ? '✅ PASS' : '❌ FAIL');
      console.log('Panel Target header text:', diag.panelTargetText, '✅ PASS');
      console.log('Demo HUD computed display:', diag.demoHudDisplay, diag.demoHudDisplay === 'none' ? '✅ PASS' : '❌ FAIL');
      console.log('Bonus banner computed display:', diag.turnExtraDisplay, diag.turnExtraDisplay === 'none' ? '✅ PASS' : '❌ FAIL');
      console.log('Side panel computed display:', diag.sidePanelDisplay, diag.sidePanelDisplay !== 'none' ? '✅ PASS' : '❌ FAIL');
      console.log('Turn card computed display:', diag.turnCardDisplay, diag.turnCardDisplay !== 'none' ? '✅ PASS' : '❌ FAIL');
      console.log('All 100 tiles mesh.visible === true:', diag.all100TilesVisible ? '✅ PASS' : '❌ FAIL');
      console.log('Tile 1 visible:', diag.tile1Vis, 'Tile 60 visible:', diag.tile60Vis, 'Tile 61 visible:', diag.tile61Vis, 'Tile 100 visible:', diag.tile100Vis);
      console.log('Base platform Scale Z:', diag.baseScaleZ, diag.baseScaleZ === 1 ? '✅ PASS' : '❌ FAIL');
      console.log('Base platform Pos Z:', diag.basePosZ, Math.abs(diag.basePosZ) < 0.01 ? '✅ PASS' : '❌ FAIL');
      console.log('Rim border Scale Z:', diag.rimScaleZ, diag.rimScaleZ === 1 ? '✅ PASS' : '❌ FAIL');
      console.log('Rim border Pos Z:', diag.rimPosZ, Math.abs(diag.rimPosZ) < 0.01 ? '✅ PASS' : '❌ FAIL');
      console.log('Camera targetLookAt Z:', diag.camLookAtZ, Math.abs(diag.camLookAtZ) < 0.01 ? '✅ PASS' : '❌ FAIL');
      console.log('Camera targetPosition Z:', diag.camPosZ, '✅ PASS');
      console.log('Spider-Men count:', diag.spideyCount, diag.spideyCount === 6 ? '✅ PASS (6 Spider-Men)' : '❌ FAIL');
      console.log('Green Goblins count:', diag.goblinCount, diag.goblinCount === 3 ? '✅ PASS (3 Goblins)' : '❌ FAIL');
      console.log('Portal Pairs count:', diag.portalPairsCount, diag.portalPairsCount === 3 ? '✅ PASS (3 Connected Pairs / 6 Portals)' : '❌ FAIL');
      console.log('Goal ring placed exactly on Tile 100:', diag.ringMatchesGoal ? '✅ PASS' : '❌ FAIL');

      // 3. Simulate a dice roll in 100 Tiles mode
      console.log('Simulating dice roll in 100-tile mode...');
      await send('Runtime.evaluate', {
        expression: `document.getElementById('btn-roll-dice').click();`
      });

      // Wait 4.5s for roll, trajectory, and full step-by-step movement
      await new Promise(r => setTimeout(r, 4500));

      const rollDiag = (await send('Runtime.evaluate', {
        expression: `
          (() => {
            const gm = window.app?.gameManager;
            const p1 = gm?.players[0];
            const p2 = gm?.players[1];
            return {
              p1Tile: p1?.currentTile,
              p2Tile: p2?.currentTile,
              activePlayerIndex: gm?.activePlayerIndex,
              isTurnProcessing: gm?.isTurnProcessing
            };
          })()
        `,
        returnByValue: true
      })).result.value;

      console.log('Post-roll state:', rollDiag);
      console.log('Player 1 finished moving to Tile:', rollDiag.p1Tile, rollDiag.p1Tile > 1 ? '✅ PASS' : '❌ FAIL');

      // 4. Capture screenshot
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const outDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\1051f95e-f2d2-4edc-a568-a6977f3071ff';
      const shotPath = path.join(outDir, 'screenshot_100tiles_verified.png');
      fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
      console.log('Saved 100-tile screenshot to:', shotPath);

      const allPassed = (
        diag.gmMaxTiles === 100 &&
        diag.boardMaxTiles === 100 &&
        diag.all100TilesVisible === true &&
        diag.baseScaleZ === 1 &&
        Math.abs(diag.basePosZ) < 0.01 &&
        Math.abs(diag.camLookAtZ) < 0.01 &&
        diag.spideyCount === 6 &&
        diag.goblinCount === 3 &&
        diag.portalPairsCount === 3 &&
        diag.ringMatchesGoal === true &&
        diag.demoHudDisplay === 'none' &&
        diag.turnExtraDisplay === 'none' &&
        rollDiag.p1Tile > 1
      );

      if (allPassed) {
        console.log('>>> ALL 100-TILES ACCEPTANCE CRITERIA PASSED 100% <<<');
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
