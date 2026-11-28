import fs from 'fs';
import path from 'path';

async function main() {
  const outDir = 'reference/portrait/verification';
  fs.mkdirSync(outDir, { recursive: true });

  const targetRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000', { method: 'PUT' });
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
    height: 900,
    deviceScaleFactor: 2,
    mobile: false,
  });

  await new Promise((r) => setTimeout(r, 2000));

  // Dismiss loader and ensure scrolled to top
  await send('Runtime.evaluate', {
    expression: `
      sessionStorage.setItem('has_seen_intro_loader', 'true');
      const loader = document.getElementById('intro-loader');
      if (loader) loader.style.display = 'none';
      window.scrollTo(0, 0);
    `,
  });
  await new Promise((r) => setTimeout(r, 800));

  // Get portrait container bounding box
  const boxRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const el = document.querySelector('[role="region"][aria-label*="portrait"]');
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      })()
    `,
    returnByValue: true,
  });

  const pBox = boxRes.result.value;
  if (!pBox) throw new Error('Could not find portrait container');

  const clip = {
    x: pBox.x - 20,
    y: pBox.y - 10,
    width: pBox.width + 40,
    height: pBox.height + 20,
    scale: 2,
  };

  // 1. REST STATE (greyscale, no movement)
  console.log('Capturing rest state...');
  const restShot = await send('Page.captureScreenshot', { format: 'png', clip });
  fs.writeFileSync(path.join(outDir, 'spotlight_rest_state.png'), Buffer.from(restShot.data, 'base64'));
  console.log('Saved spotlight_rest_state.png');

  // 2. MID-MOVE SPOTLIGHT (simulate pointer movement across face and shoulder)
  console.log('Simulating pointer movement across face...');
  const startX = pBox.x + pBox.width * 0.35;
  const startY = pBox.y + pBox.height * 0.15;
  const midX = pBox.x + pBox.width * 0.45;
  const midY = pBox.y + pBox.height * 0.28;

  // Move pointer via Input domain
  await send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: startX,
    y: startY,
  });
  await new Promise((r) => setTimeout(r, 50));

  // Interpolate movement
  for (let i = 1; i <= 10; i++) {
    const curX = startX + (midX - startX) * (i / 10);
    const curY = startY + (midY - startY) * (i / 10);
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: curX,
      y: curY,
    });
    await new Promise((r) => setTimeout(r, 20));
  }

  // Capture immediately while spotlight is vibrant
  const midMoveShot = await send('Page.captureScreenshot', { format: 'png', clip });
  fs.writeFileSync(path.join(outDir, 'spotlight_mid_move.png'), Buffer.from(midMoveShot.data, 'base64'));
  console.log('Saved spotlight_mid_move.png');

  // 3. FADING TRAIL (move cursor away, capture after 400ms while trailing)
  console.log('Simulating pointer exit and capturing fading trail...');
  await send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: pBox.x + pBox.width + 50,
    y: pBox.y + pBox.height + 50,
  });
  // Wait 400ms for gradual decay
  await new Promise((r) => setTimeout(r, 400));

  const trailShot = await send('Page.captureScreenshot', { format: 'png', clip });
  fs.writeFileSync(path.join(outDir, 'spotlight_fading_trail.png'), Buffer.from(trailShot.data, 'base64'));
  console.log('Saved spotlight_fading_trail.png');

  await send('Page.close');
  ws.close();
  console.log('All verification captures completed!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
