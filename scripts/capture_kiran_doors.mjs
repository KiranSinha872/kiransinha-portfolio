import fs from 'fs';

async function capture() {
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
  await new Promise((r) => setTimeout(r, 3000));

  // Dismiss loader if present and ensure session storage
  await send('Runtime.evaluate', {
    expression: `
      sessionStorage.setItem('has_seen_intro_loader', 'true');
      const loader = document.getElementById('intro-loader');
      if (loader) loader.style.display = 'none';
      window.scrollTo(0, 0);
    `,
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Capture Hero Portrait Rest (greyscale, halo hidden)
  console.log('Capturing hero portrait rest...');
  const heroShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('reference/doors/kiran_portrait_rest.png', Buffer.from(heroShot.data, 'base64'));

  // Scroll to #projects
  console.log('Scrolling to #projects...');
  await send('Runtime.evaluate', {
    expression: `
      const sec = document.getElementById('projects');
      if (sec) sec.scrollIntoView({ behavior: 'instant', block: 'center' });
    `,
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Capture Doors Closed
  console.log('Capturing kiran_closed.png...');
  const closedShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('reference/doors/kiran_closed.png', Buffer.from(closedShot.data, 'base64'));

  // Trigger hover crack-open on door 0
  console.log('Triggering hover crack-open on door 0...');
  await send('Runtime.evaluate', {
    expression: `
      const door0 = document.getElementById('door-leaf-0');
      if (door0) {
        door0.style.transform = 'rotateY(10deg)';
        const unit = door0.closest('.group');
        if (unit) {
          const pool = unit.querySelector('.room-pool');
          if (pool) pool.style.opacity = '0.6';
          const sill = unit.querySelector('.room-sill');
          if (sill) sill.style.opacity = '0.7';
        }
      }
      const badge = document.getElementById('doorCursor');
      if (badge) {
        badge.style.opacity = '1';
        badge.style.transform = 'translate3d(480px, 460px, 0) translate(-50%, -50%)';
      }
    `,
  });
  await new Promise((r) => setTimeout(r, 600));

  console.log('Capturing kiran_hover.png...');
  const hoverShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('reference/doors/kiran_hover.png', Buffer.from(hoverShot.data, 'base64'));

  // Trigger click on door 0 to open overview modal
  console.log('Triggering click to open overview modal...');
  await send('Runtime.evaluate', {
    expression: `
      const doorBtn = document.querySelector('button[aria-label^="Open project"]');
      if (doorBtn) doorBtn.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 800));

  console.log('Capturing kiran_open.png...');
  const openShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('reference/doors/kiran_open.png', Buffer.from(openShot.data, 'base64'));

  // Close target
  await send('Page.close');
  ws.close();
  await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
  console.log('Done capturing!');
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
