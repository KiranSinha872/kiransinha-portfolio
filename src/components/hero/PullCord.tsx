'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/components/theme/ThemeProvider';

export default function PullCord() {
  const { mode, toggleMode } = useTheme();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const hit = hitRef.current;
    if (!wrap || !canvas || !hit) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const N = 26; // Number of rope segments
    const G = 4600; // Gravity in px/s^2
    const STEP = 1 / 120;
    const ITER = 16; // Constraint relaxation passes

    let dpr = 1;
    let W = 320;
    let H = 520;
    let L = 220;
    let EXT_MAX = 54;
    let HIDDEN = 70;
    let seg = 10;
    let ax = 240;
    let thick = 3.2;

    interface Point {
      x: number;
      y: number;
      px: number;
      py: number;
      w: number;
    }

    const pts: Point[] = [];
    let ext = 0;
    let extV = 0;
    let armed = true;
    let grab = -1;
    let grabOff = { x: 0, y: 0 };
    let target: { x: number; y: number } | null = null;
    let ptr: { x: number; y: number } | null = null;
    let ptrPrev: { x: number; y: number } | null = null;
    let downAt = 0;
    let downPos: { x: number; y: number } | null = null;
    let moved = 0;
    let acc = 0;
    let lastT = 0;
    let live = false;
    let animId: number | null = null;

    function wake() {
      if (!live) {
        live = true;
        lastT = performance.now();
        animId = requestAnimationFrame(loop);
      }
    }

    function sleep() {
      live = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }

    function layout() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let offset = 40;

      if (vw >= 1024) {
        offset = 64;
        L = Math.min(270, Math.max(180, vh * 0.28));
        EXT_MAX = 65;
        thick = 3.5;
      } else if (vw >= 640) {
        offset = 48;
        L = Math.min(220, Math.max(160, vh * 0.22));
        EXT_MAX = 55;
        thick = 3.2;
      } else {
        offset = 36;
        L = 90;
        EXT_MAX = 48;
        thick = 3.0;
      }

      HIDDEN = EXT_MAX + 18;
      W = Math.min(vw, 320);
      H = Math.round(L + EXT_MAX + 160);
      wrap!.style.height = `${H}px`;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);

      const newAx = W - offset;
      const total = L + HIDDEN;
      seg = total / N;

      if (pts.length === 0) {
        for (let i = 0; i <= N; i++) {
          const x = newAx;
          const y = -HIDDEN + i * seg;
          pts.push({ x, y, px: x, py: y, w: i === 0 ? 0 : i === N ? 0.3 : 1 });
        }
      } else {
        const dx = newAx - ax;
        for (const p of pts) {
          p.x += dx;
          p.px += dx;
        }
      }
      ax = newAx;
      wake();
    }

    function stepPhysics(dt: number) {
      // Switch spring: returns to resting position when not pulled
      if (grab < 0) {
        const K = 780;
        const C = 22;
        extV += (-K * ext - C * extV) * dt;
        ext += extV * dt;
      }

      // Check pull trigger
      if (ext > EXT_MAX * 0.75 && armed) {
        armed = false;
        toggleMode();
        try {
          navigator.vibrate?.(12);
        } catch {}
      }
      if (ext < EXT_MAX * 0.2) {
        armed = true;
      }

      // Pin anchor to switch extension
      pts[0].x = pts[0].px = ax;
      pts[0].y = pts[0].py = -HIDDEN + ext;

      const damp = grab >= 0 ? 0.992 : 0.985;
      for (let i = 1; i <= N; i++) {
        if (i === grab) continue;
        const p = pts[i];
        const vx = (p.x - p.px) * damp;
        const vy = (p.y - p.py) * damp;
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy + G * dt * dt;
      }

      if (grab >= 0 && target) {
        const g = pts[grab];
        g.px = g.x;
        g.py = g.y;
        g.x = target.x;
        g.y = target.y;
      }

      // Verlet distance relaxation passes
      for (let k = 0; k < ITER; k++) {
        for (let i = 0; i < N; i++) {
          const p1 = pts[i];
          const p2 = pts[i + 1];
          const w1 = i === grab ? 0 : p1.w;
          const w2 = i + 1 === grab ? 0 : p2.w;
          const sw = w1 + w2;
          if (!sw) continue;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy) || 1e-6;
          const diff = (dist - seg) / dist / sw;

          p1.x += dx * diff * w1;
          p1.y += dy * diff * w1;
          p2.x -= dx * diff * w2;
          p2.y -= dy * diff * w2;
        }
      }

      // Keep within bounds
      for (let i = 1; i <= N; i++) {
        const p = pts[i];
        if (p.x < 14) p.x = 14;
        else if (p.x > W - 14) p.x = W - 14;
        if (p.y > H - 40) p.y = H - 40;
      }
    }

    function updateDrag() {
      if (grab < 0 || !ptr) return;
      let tx = ptr.x - grabOff.x;
      let ty = ptr.y - grabOff.y;
      const bx = ax;
      const by = -HIDDEN;
      const reach = grab * seg;

      const dx = tx - bx;
      const dy = ty - by;
      const dist = Math.hypot(dx, dy) || 1e-6;
      let need = dist - reach;

      if (need > EXT_MAX) {
        const over = need - EXT_MAX;
        const allowed = reach + EXT_MAX + (over * 0.15) / (1 + over / 160);
        tx = bx + (dx / dist) * allowed;
        ty = by + (dy / dist) * allowed;
        need = EXT_MAX;
      }

      const targetExt = Math.max(0, need);
      const prevExt = ext;
      ext += (targetExt - ext) * 0.55;
      extV = (ext - prevExt) * 60;
      target = { x: Math.max(14, Math.min(W - 14, tx)), y: Math.min(H - 40, ty) };
    }

    function getLocalPos(e: PointerEvent | MouseEvent | Touch) {
      const r = wrap!.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function startDrag(pos: { x: number; y: number }, idx: number) {
      wake();
      grab = idx;
      const g = pts[idx];
      grabOff = { x: pos.x - g.x, y: pos.y - g.y };
      ptr = ptrPrev = pos;
      target = { x: g.x, y: g.y };
      downAt = performance.now();
      downPos = pos;
      moved = 0;
      wrap!.classList.add('dragging');
      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);
    }

    function onPointerMove(e: PointerEvent) {
      if (grab < 0) return;
      e.preventDefault();
      ptrPrev = ptr;
      ptr = getLocalPos(e);
      if (downPos) {
        moved = Math.max(moved, Math.hypot(ptr.x - downPos.x, ptr.y - downPos.y));
      }
    }

    function tug() {
      wake();
      extV = EXT_MAX * 42;
      pts[N].px = pts[N].x + 2;
    }

    function endDrag() {
      if (grab < 0) return;
      const g = pts[grab];
      if (ptr && ptrPrev) {
        const vx = ptr.x - ptrPrev.x;
        const vy = ptr.y - ptrPrev.y;
        g.px = g.x - vx * 0.5;
        g.py = g.y - vy * 0.5;
      }
      const tap = moved < 6 && performance.now() - downAt < 300;
      grab = -1;
      target = null;
      ptr = ptrPrev = null;
      wrap!.classList.remove('dragging');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);

      if (tap) {
        tug();
      }
    }

    // Hit-box pointer events (knob)
    const onHitPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      try {
        hit!.setPointerCapture(e.pointerId);
      } catch {}
      startDrag(getLocalPos(e), N);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tug();
      }
    };

    hit.addEventListener('pointerdown', onHitPointerDown);
    hit.addEventListener('keydown', onKeyDown);

    // Canvas rendering
    function renderCanvas() {
      if (!ctx) return;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      const isDark = document.documentElement.dataset.mode === 'dark';
      const cordColor = isDark ? '#D9C6C6' : '#5A4C4C';
      const knobColor = isDark ? '#E8E4E0' : '#1A1818';

      // 1. Draw rope shadow
      ctx.beginPath();
      ctx.moveTo(pts[0].x + 2, pts[0].y + 4);
      for (let i = 1; i < N; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2 + 2;
        const my = (pts[i].y + pts[i + 1].y) / 2 + 4;
        ctx.quadraticCurveTo(pts[i].x + 2, pts[i].y + 4, mx, my);
      }
      ctx.lineTo(pts[N].x + 2, pts[N].y + 4);
      ctx.strokeStyle = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.12)';
      ctx.lineWidth = thick + 1;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 2. Draw rope body
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < N; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      ctx.lineTo(pts[N].x, pts[N].y);
      ctx.strokeStyle = cordColor;
      ctx.lineWidth = thick;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 3. Draw metallic/wood bell knob at the bottom
      const end = pts[N];
      const prev = pts[N - 2] || pts[N - 1];
      const angle = Math.atan2(end.y - prev.y, end.x - prev.x);

      ctx.save();
      ctx.translate(end.x, end.y);
      ctx.rotate(angle - Math.PI / 2);

      // Knob shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.arc(0, 2, 7.5, 0, Math.PI * 2);
      ctx.fill();

      // Knob bell
      ctx.fillStyle = knobColor;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      // Subtle shine highlight
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(-2, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      ctx.restore();

      // Position the accessible invisible hit button right over the knob
      hit!.style.transform = `translate3d(${end.x}px, ${end.y}px, 0)`;
    }

    function loop(now: number) {
      if (!live) return;
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      acc += dt;

      while (acc >= STEP) {
        updateDrag();
        stepPhysics(STEP);
        acc -= STEP;
      }

      renderCanvas();

      // Check if settled to stop unnecessary render loops
      let motion = Math.abs(extV);
      for (let i = 1; i <= N; i++) {
        motion += Math.hypot(pts[i].x - pts[i].px, pts[i].y - pts[i].py);
      }
      if (motion < 0.05 && grab < 0 && Math.abs(ext) < 0.1) {
        sleep();
      } else {
        animId = requestAnimationFrame(loop);
      }
    }

    layout();
    window.addEventListener('resize', layout);

    // Pause physics when off-screen
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        wake();
      } else {
        sleep();
      }
    });
    observer.observe(wrap);

    return () => {
      sleep();
      observer.disconnect();
      window.removeEventListener('resize', layout);
      hit.removeEventListener('pointerdown', onHitPointerDown);
      hit.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, [toggleMode]);

  return (
    <div
      ref={wrapRef}
      id="cord"
      className="fixed top-0 right-0 w-[min(100%,320px)] h-[520px] z-50 pointer-events-none select-none overflow-hidden"
      aria-hidden="false"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <button
        ref={hitRef}
        id="cordHit"
        type="button"
        role="switch"
        aria-checked={mode === 'dark'}
        aria-label={`Toggle theme (pull the cord). Current: ${mode} mode`}
        title="Pull cord to toggle theme"
        className="absolute left-0 top-0 w-16 h-16 -ml-8 -mt-8 rounded-full pointer-events-auto touch-none cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-[#0B7658] focus-visible:outline-offset-2 opacity-0 hover:opacity-10 transition-opacity bg-white/20"
      />
    </div>
  );
}
