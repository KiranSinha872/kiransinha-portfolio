import fs from 'fs';

async function cdp() {
  const versionRes = await fetch('http://127.0.0.1:9222/json/version');
  const version = await versionRes.json();
  console.log('Browser:', version.Browser);

  // Create new target
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
  console.log('Connected to target WebSocket');

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  // Set viewport to desktop 1440x900
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false,
  });

  console.log('Navigating to https://therishithakor.com/...');
  await send('Page.navigate', { url: 'https://therishithakor.com/' });

  // Wait for page load
  await new Promise((r) => setTimeout(r, 4500));

  // Dismiss loader if present
  await send('Runtime.evaluate', {
    expression: `
      document.body.classList.add('ready');
      const loader = document.getElementById('loader');
      if (loader) loader.style.display = 'none';
      const sec = document.getElementById('works');
      if (sec) sec.scrollIntoView({ behavior: 'instant', block: 'center' });
    `,
  });

  await new Promise((r) => setTimeout(r, 1500));

  // 1. Capture Desktop Closed
  console.log('Capturing desktop_closed.png...');
  const closedShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('reference/doors/desktop_closed.png', Buffer.from(closedShot.data, 'base64'));

  // 2. Trigger hover on first doorway (open angle ~10deg)
  console.log('Triggering hover crack-open on first door...');
  await send('Runtime.evaluate', {
    expression: `
      const u = document.querySelector('#works .unit');
      if (u) {
        const door = u.querySelector('.door');
        if (door) door.style.transform = 'rotateY(10deg)';
        u.style.setProperty('--o', '0.14');
        const badge = document.getElementById('doorCursor');
        if (badge) {
          badge.classList.add('on');
          badge.style.transform = 'translate3d(500px, 450px, 0) translate(-50%, -50%)';
        }
      }
    `,
  });
  await new Promise((r) => setTimeout(r, 600));

  console.log('Capturing desktop_hover.png...');
  const hoverShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('reference/doors/desktop_hover.png', Buffer.from(hoverShot.data, 'base64'));

  // 3. Trigger fully open door (open angle 70deg)
  console.log('Triggering fully open door (70deg)...');
  await send('Runtime.evaluate', {
    expression: `
      const u = document.querySelector('#works .unit');
      if (u) {
        const door = u.querySelector('.door');
        if (door) door.style.transform = 'rotateY(70deg)';
        u.style.setProperty('--o', '1');
        const sill = u.querySelector('.sill');
        if (sill) sill.style.opacity = '1';
        const pool = u.querySelector('.pool');
        if (pool) pool.style.opacity = '1';
      }
    `,
  });
  await new Promise((r) => setTimeout(r, 600));

  console.log('Capturing desktop_open.png...');
  const openShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('reference/doors/desktop_open.png', Buffer.from(openShot.data, 'base64'));

  // 4. Switch to mobile viewport (390x844)
  console.log('Switching to mobile viewport 390x844...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  await send('Runtime.evaluate', {
    expression: `
      const sec = document.getElementById('works');
      if (sec) sec.scrollIntoView({ behavior: 'instant', block: 'center' });
    `,
  });
  await new Promise((r) => setTimeout(r, 1000));

  console.log('Capturing mobile_doors.png...');
  const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('reference/doors/mobile_doors.png', Buffer.from(mobileShot.data, 'base64'));

  // 5. Query detailed computed styles
  const stylesRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `
      (() => {
        const unit = document.querySelector('#works .unit');
        const doorway = document.querySelector('#works .doorway');
        const casing = document.querySelector('#works .casing');
        const opening = document.querySelector('#works .opening');
        const door = document.querySelector('#works .door');
        const plate = document.querySelector('#works .plate');
        const handle = document.querySelector('#works .handle');
        const sill = document.querySelector('#works .sill');
        const paint = document.querySelector('#works .paint');
        const photo = document.querySelector('.hero__photo img, .hero__portrait img, #hero img');

        const getCS = el => el ? JSON.parse(JSON.stringify(window.getComputedStyle(el))) : null;

        return {
          doorway: doorway ? {
            aspectRatio: doorway.style.aspectRatio || window.getComputedStyle(doorway).aspectRatio,
            borderRadius: window.getComputedStyle(doorway).borderRadius,
            width: doorway.getBoundingClientRect().width,
            height: doorway.getBoundingClientRect().height,
          } : null,
          casing: casing ? {
            background: window.getComputedStyle(casing).background,
            boxShadow: window.getComputedStyle(casing).boxShadow,
            borderRadius: window.getComputedStyle(casing).borderRadius,
          } : null,
          door: door ? {
            background: window.getComputedStyle(door).background,
            borderRadius: window.getComputedStyle(door).borderRadius,
            boxShadow: window.getComputedStyle(door).boxShadow,
            transformOrigin: window.getComputedStyle(door).transformOrigin,
          } : null,
          plate: plate ? {
            background: window.getComputedStyle(plate).background,
            color: window.getComputedStyle(plate).color,
            fontSize: window.getComputedStyle(plate).fontSize,
            fontFamily: window.getComputedStyle(plate).fontFamily,
            boxShadow: window.getComputedStyle(plate).boxShadow,
            textTransform: window.getComputedStyle(plate).textTransform,
            letterSpacing: window.getComputedStyle(plate).letterSpacing,
          } : null,
          handle: handle ? {
            background: window.getComputedStyle(handle).background,
            width: window.getComputedStyle(handle).width,
            height: window.getComputedStyle(handle).height,
            borderRadius: window.getComputedStyle(handle).borderRadius,
          } : null,
          sill: sill ? {
            background: window.getComputedStyle(sill).background,
            filter: window.getComputedStyle(sill).filter,
          } : null,
          paint: paint ? {
            fontFamily: window.getComputedStyle(paint).fontFamily,
            fontSize: window.getComputedStyle(paint).fontSize,
            fontWeight: window.getComputedStyle(paint).fontWeight,
            color: window.getComputedStyle(paint).color,
          } : null,
        };
      })()
    `,
  });

  fs.writeFileSync('reference/doors/computed_styles.json', JSON.stringify(stylesRes.result.value, null, 2));
  console.log('Saved reference/doors/computed_styles.json');

  ws.close();
  await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
  console.log('All screenshots and data captured successfully!');
}

cdp().catch(console.error);
