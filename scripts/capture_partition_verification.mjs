import fs from 'fs';
import path from 'path';

async function main() {
  const outDir = 'reference/portrait/verification';
  fs.mkdirSync(outDir, { recursive: true });

  const targetRes = await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' });
  const target = await targetRes.json();
  console.log('Target created:', target.id);

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const curId = id++;
      pending.set(curId, { resolve, reject });
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  };

  await new Promise((resolve) => ws.onopen = resolve);

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 960,
    deviceScaleFactor: 2,
    mobile: false,
  });

  console.log('Navigating to http://localhost:3000...');
  await send('Page.navigate', { url: 'http://localhost:3000' });
  await new Promise((r) => setTimeout(r, 2500));

  // Dismiss loader and ensure top position
  await send('Runtime.evaluate', {
    expression: `
      sessionStorage.setItem('has_seen_intro_loader', 'true');
      const loader = document.getElementById('intro-loader');
      if (loader) loader.style.display = 'none';
      window.scrollTo(0, 0);
    `,
  });
  await new Promise((r) => setTimeout(r, 1000));

  const parts = ['hair', 'face', 'hands', 'shirt', 'tie', 'jacket', 'trousers'];

  // Helper to capture portrait element clip
  async function capturePortrait(filename) {
    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.querySelector('.cursor-crosshair');
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        })()
      `,
      returnByValue: true,
    });
    const clip = evalRes.result.value;
    if (!clip) {
      console.warn('Could not find portrait element clip, capturing full page');
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(outDir, filename), Buffer.from(shot.data, 'base64'));
      return;
    }

    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: clip.x - 20,
        y: clip.y - 10,
        width: clip.width + 40,
        height: clip.height + 20,
        scale: 2,
      },
    });
    fs.writeFileSync(path.join(outDir, filename), Buffer.from(shot.data, 'base64'));
    console.log(`Saved ${filename}`);
  }

  // Helper to set active part (or all)
  async function setActivePart(activePartId) {
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const parts = ['hair', 'face', 'hands', 'shirt', 'tie', 'jacket', 'trousers'];
          parts.forEach(p => {
            const el = document.getElementById('portrait-part-' + p);
            if (el) {
              if ('${activePartId}' === 'ALL') {
                el.style.opacity = '1';
              } else if (p === '${activePartId}') {
                el.style.opacity = '1';
              } else {
                el.style.opacity = '0';
              }
            }
          });
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 300));
  }

  // 1. Capture in DARK theme (default)
  console.log('--- Capturing DARK theme parts ---');
  await send('Runtime.evaluate', {
    expression: `document.documentElement.classList.add('dark'); document.documentElement.classList.remove('light');`,
  });

  for (const p of parts) {
    await setActivePart(p);
    await capturePortrait(`dark_part_${p}.png`);
  }

  // 2. Capture in LIGHT theme
  console.log('--- Capturing LIGHT theme parts ---');
  await send('Runtime.evaluate', {
    expression: `document.documentElement.classList.remove('dark'); document.documentElement.classList.add('light');`,
  });

  for (const p of parts) {
    await setActivePart(p);
    await capturePortrait(`light_part_${p}.png`);
  }

  // 3. Capture ALL parts locked together (visually equals original photo)
  console.log('--- Capturing ALL parts locked ---');
  await setActivePart('ALL');
  await capturePortrait('all_parts_locked.png');

  // Restore dark theme
  await send('Runtime.evaluate', {
    expression: `document.documentElement.classList.add('dark'); document.documentElement.classList.remove('light');`,
  });

  // Close CDP page
  await send('Page.close');
  ws.close();
  console.log('\nAll browser verification screenshots captured successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
