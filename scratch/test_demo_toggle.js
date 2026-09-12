import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = 'd:\\temp_edge_demo_flow';

const p = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9226',
  `--user-data-dir=${userDataDir}`,
  '--window-size=1280,720',
  'http://localhost:9000/'
]);

async function run() {
  let tabs = null;
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 600));
    try {
      const res = await fetch('http://127.0.0.1:9226/json');
      tabs = await res.json();
      if (tabs && tabs.length > 0) break;
    } catch (e) {}
  }

  const gameTab = tabs.find(t => t.url.includes('9000')) || tabs[0];
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
      await new Promise(r => setTimeout(r, 1500));

      // 1. Click Start Game 60 tiles
      await send('Runtime.evaluate', {
        expression: `
          document.querySelector('.game-mode-btn[data-tiles="60"]').click();
          document.getElementById('btn-start-game').click();
        `
      });
      await new Promise(r => setTimeout(r, 800));

      // 2. Click Top Demo button
      await send('Runtime.evaluate', {
        expression: `document.getElementById('btn-top-demo').click();`
      });
      await new Promise(r => setTimeout(r, 800));

      // Verify Demo mode UI
      const demoState = (await send('Runtime.evaluate', {
        expression: `
          (() => {
            const demoHud = document.getElementById('demo-hud');
            const sidePanel = document.querySelector('.side-panel');
            const bottomBar = document.querySelector('.bottom-bar');
            return {
              demoHudDisplay: window.getComputedStyle(demoHud).display,
              sidePanelDisplay: window.getComputedStyle(sidePanel).display,
              bottomBarDisplay: window.getComputedStyle(bottomBar).display,
              isDemoActive: window.app?.gameManager?.demoDirector?.isActive
            };
          })()
        `,
        returnByValue: true
      })).result.value;

      console.log('DEMO ACTIVE CHECK:');
      console.log('Demo HUD visible:', demoState.demoHudDisplay !== 'none' ? 'PASS' : 'FAIL');
      console.log('Side panel hidden during demo:', demoState.sidePanelDisplay === 'none' ? 'PASS' : 'FAIL');
      console.log('Bottom bar hidden during demo:', demoState.bottomBarDisplay === 'none' ? 'PASS' : 'FAIL');
      console.log('Demo isActive:', demoState.isDemoActive ? 'PASS' : 'FAIL');

      // 3. Click Exit Demo
      await send('Runtime.evaluate', {
        expression: `document.getElementById('btn-demo-exit').click();`
      });
      await new Promise(r => setTimeout(r, 1000));

      // Verify gameplay restored
      const restoredState = (await send('Runtime.evaluate', {
        expression: `
          (() => {
            const demoHud = document.getElementById('demo-hud');
            const sidePanel = document.querySelector('.side-panel');
            const bottomBar = document.querySelector('.bottom-bar');
            return {
              demoHudDisplay: window.getComputedStyle(demoHud).display,
              sidePanelDisplay: window.getComputedStyle(sidePanel).display,
              bottomBarDisplay: window.getComputedStyle(bottomBar).display,
              isDemoActive: window.app?.gameManager?.demoDirector?.isActive
            };
          })()
        `,
        returnByValue: true
      })).result.value;

      console.log('GAME RESTORED CHECK:');
      console.log('Demo HUD hidden after exit:', restoredState.demoHudDisplay === 'none' ? 'PASS' : 'FAIL');
      console.log('Side panel visible after exit:', restoredState.sidePanelDisplay !== 'none' ? 'PASS' : 'FAIL');
      console.log('Bottom bar visible after exit:', restoredState.bottomBarDisplay !== 'none' ? 'PASS' : 'FAIL');
      console.log('Demo is NOT active:', !restoredState.isDemoActive ? 'PASS' : 'FAIL');

      const pass = (
        demoState.demoHudDisplay !== 'none' &&
        demoState.sidePanelDisplay === 'none' &&
        demoState.bottomBarDisplay === 'none' &&
        demoState.isDemoActive === true &&
        restoredState.demoHudDisplay === 'none' &&
        restoredState.sidePanelDisplay !== 'none' &&
        restoredState.bottomBarDisplay !== 'none' &&
        restoredState.isDemoActive === false
      );

      console.log(pass ? '>>> DEMO TOGGLE TEST PASSED 100% <<<' : '>>> DEMO TOGGLE TEST FAILED <<<');

      ws.close();
      p.kill();
      process.exit(pass ? 0 : 1);
    } catch (e) {
      console.error(e);
      ws.close();
      p.kill();
      process.exit(1);
    }
  };
}

run();
