import fs from 'fs';

async function captureParts() {
  fs.mkdirSync('reference/portrait', { recursive: true });

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
    height: 900,
    deviceScaleFactor: 2,
    mobile: false,
  });

  console.log('Navigating to http://localhost:3000...');
  await send('Page.navigate', { url: 'http://localhost:3000' });
  await new Promise((r) => setTimeout(r, 2500));

  // Dismiss loader
  await send('Runtime.evaluate', {
    expression: `
      sessionStorage.setItem('has_seen_intro_loader', 'true');
      const loader = document.getElementById('intro-loader');
      if (loader) loader.style.display = 'none';
      window.scrollTo(0, 0);
    `,
  });
  await new Promise((r) => setTimeout(r, 1000));

  // 1. Capture Portrait at Rest (Greyscale, NO green circle)
  console.log('Capturing portrait_rest.png...');
  const restShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('reference/portrait/portrait_rest.png', Buffer.from(restShot.data, 'base64'));

  // Define parts
  const parts = ['hair', 'face_skin', 'shirt', 'tie', 'jacket', 'trousers'];

  for (const pid of parts) {
    console.log(`Highlighting part: ${pid}...`);
    await send('Runtime.evaluate', {
      expression: `
        // Turn off all parts
        ['hair', 'face_skin', 'shirt', 'tie', 'jacket', 'trousers'].forEach(p => {
          const el = document.getElementById('portrait-part-' + p);
          if (el) el.style.opacity = '0';
        });
        // Turn on target part
        const target = document.getElementById('portrait-part-${pid}');
        if (target) target.style.opacity = '1';
      `,
    });
    await new Promise((r) => setTimeout(r, 450));

    const partShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`reference/portrait/part_${pid}.png`, Buffer.from(partShot.data, 'base64'));
  }

  // Restore all
  await send('Runtime.evaluate', {
    expression: `
      ['hair', 'face_skin', 'shirt', 'tie', 'jacket', 'trousers'].forEach(p => {
        const el = document.getElementById('portrait-part-' + p);
        if (el) el.style.opacity = '0';
      });
    `,
  });

  // Capture Flip card
  console.log('Capturing flip card...');
  const flipShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('reference/portrait/flip_card.png', Buffer.from(flipShot.data, 'base64'));

  await send('Page.close');
  ws.close();
  await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
  console.log('Done capturing portrait parts!');
}

captureParts().catch(e => {
  console.error(e);
  process.exit(1);
});
