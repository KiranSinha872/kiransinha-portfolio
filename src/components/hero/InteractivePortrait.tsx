'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface InteractivePortraitProps {
  onOpenDevCard?: () => void;
}

export default function InteractivePortrait({ onOpenDevCard }: InteractivePortraitProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const colorImgRef = useRef<HTMLImageElement | null>(null);

  const [isFocused, setIsFocused] = useState(false);
  const prefersReduced = useReducedMotion();

  // Animation and trail state stored in refs to avoid re-renders
  const animFrameIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastTimeRef = useRef<number>(0);
  const activeTrailRef = useRef<boolean>(false);
  const lastDrawTimeRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);
  const renderFrameRef = useRef<(now: number) => void>(() => {});

  // Setup offscreen canvas and load color image
  useEffect(() => {
    const mask = document.createElement('canvas');
    maskCanvasRef.current = mask;

    const img = new window.Image();
    img.src = '/images/my-photo.png';
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      colorImgRef.current = img;
    };

    // IntersectionObserver to pause loop when portrait is off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  // Resize handler to match container CSS size & devicePixelRatio
  const syncCanvasSize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const mask = maskCanvasRef.current;
    if (!container || !canvas || !mask) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      mask.width = w;
      mask.height = h;

      const mCtx = mask.getContext('2d');
      if (mCtx) mCtx.clearRect(0, 0, w, h);
    }
  }, []);

  useEffect(() => {
    syncCanvasSize();
    window.addEventListener('resize', syncCanvasSize);
    return () => window.removeEventListener('resize', syncCanvasSize);
  }, [syncCanvasSize]);

  // Stamp a soft radial gradient on the mask canvas
  const stampSpotlight = (x: number, y: number, radius: number) => {
    const mask = maskCanvasRef.current;
    if (!mask) return;
    const mCtx = mask.getContext('2d');
    if (!mCtx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const px = x * dpr;
    const py = y * dpr;
    const pradius = radius * dpr;

    const grad = mCtx.createRadialGradient(px, py, 0, px, py, pradius);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    mCtx.save();
    mCtx.globalCompositeOperation = 'source-over';
    mCtx.fillStyle = grad;
    mCtx.beginPath();
    mCtx.arc(px, py, pradius, 0, Math.PI * 2);
    mCtx.fill();
    mCtx.restore();
  };

  // Main animation frame: fades the trail and composites the color cutout
  const renderFrame = useCallback((now: number) => {
    const canvas = canvasRef.current;
    const mask = maskCanvasRef.current;
    const colorImg = colorImgRef.current;

    if (!canvas || !mask || !colorImg) {
      animFrameIdRef.current = requestAnimationFrame((t) => renderFrameRef.current(t));
      return;
    }

    const dt = lastTimeRef.current ? Math.min((now - lastTimeRef.current) / 1000, 0.1) : 0.016;
    lastTimeRef.current = now;

    const mCtx = mask.getContext('2d');
    const ctx = canvas.getContext('2d');
    if (!mCtx || !ctx) return;

    // Fade mask: gradual fade over ~1.6s
    // Multiply alpha by exponential decay factor based on elapsed time dt
    const fadeRate = 1.6; // duration in seconds
    const fadeFactor = Math.exp(-dt / (fadeRate * 0.35));

    mCtx.save();
    mCtx.globalCompositeOperation = 'destination-out';
    // Remove (1 - fadeFactor) fraction of alpha
    mCtx.fillStyle = `rgba(0, 0, 0, ${(1 - fadeFactor) * 2.5})`;
    mCtx.fillRect(0, 0, mask.width, mask.height);
    mCtx.restore();

    // Composite colour image through mask onto visible canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // 1. Draw colour cut-out photo
    ctx.drawImage(colorImg, 0, 0, canvas.width, canvas.height);

    // 2. destination-in with mask: clips colour image to spotlight trail AND cutout silhouette
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Check if mask has completely faded after user stops drawing (> 2.0s)
    const timeSinceLastDraw = now - lastDrawTimeRef.current;
    if (timeSinceLastDraw > 2200 && !activeTrailRef.current) {
      // Fully clear and stop animation loop to conserve CPU/battery
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      mCtx.clearRect(0, 0, mask.width, mask.height);
      animFrameIdRef.current = null;
      return;
    }

    // Continue loop if visible
    if (isVisibleRef.current) {
      animFrameIdRef.current = requestAnimationFrame((t) => renderFrameRef.current(t));
    } else {
      animFrameIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    renderFrameRef.current = renderFrame;
  }, [renderFrame]);

  const ensureAnimationLoop = () => {
    if (!animFrameIdRef.current && isVisibleRef.current) {
      lastTimeRef.current = performance.now();
      animFrameIdRef.current = requestAnimationFrame((t) => renderFrameRef.current(t));
    }
  };

  // Paint spotlight and interpolate between positions for a continuous streak
  const handlePointerStroke = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
      lastPosRef.current = null;
      return;
    }

    const radius = Math.min(Math.max(rect.width * 0.32, 85), 125);
    const now = performance.now();
    lastDrawTimeRef.current = now;
    activeTrailRef.current = true;

    if (lastPosRef.current) {
      const dx = x - lastPosRef.current.x;
      const dy = y - lastPosRef.current.y;
      const dist = Math.hypot(dx, dy);
      const step = Math.max(radius * 0.15, 8);
      const steps = Math.ceil(dist / step);

      for (let i = 1; i <= steps; i++) {
        const ix = lastPosRef.current.x + (dx * i) / steps;
        const iy = lastPosRef.current.y + (dy * i) / steps;
        stampSpotlight(ix, iy, radius);
      }
    } else {
      stampSpotlight(x, y, radius);
    }

    lastPosRef.current = { x, y };
    ensureAnimationLoop();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerStroke(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerStroke(e.clientX, e.clientY);
  };

  const handlePointerLeave = () => {
    lastPosRef.current = null;
    activeTrailRef.current = false;
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Interactive Cut-Out Portrait Container */}
      <div
        ref={containerRef}
        tabIndex={0}
        role="region"
        aria-label="Interactive portrait of Kiran Sinha. Move cursor or touch to reveal color spotlight."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="relative w-[280px] sm:w-[320px] lg:w-[360px] aspect-[515/1024] cursor-pointer select-none rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background)] transition-shadow touch-pan-y"
      >
        {/* Floating "My developer card" Badge on the portrait (Chest area, face clear) */}
        {onOpenDevCard && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDevCard();
            }}
            className="absolute top-[52%] sm:top-[48%] -left-3 sm:-left-6 z-20 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--line)] bg-[var(--background)]/95 backdrop-blur-md shadow-xl text-xs font-semibold text-[var(--foreground)] hover:border-[#0B7658] hover:scale-105 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
            title="Explore Developer Ability Card"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0B7658]" />
            <span>My developer card</span>
          </button>
        )}

        {/* Base Layer: Greyscale cut-out photo */}
        <div className="absolute inset-0 pointer-events-none filter grayscale contrast-[1.03]">
          <Image
            src="/images/my-photo.png"
            alt="Kiran Sinha"
            fill
            priority
            sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 360px"
            className="object-contain"
          />
        </div>

        {/* Dynamic Colour Layer: Driven by Canvas Spotlight Trail Mask */}
        {!prefersReduced ? (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none object-contain"
          />
        ) : (
          /* Reduced Motion / Keyboard Focus Fallback: Soft Static Centred Reveal */
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ease-out ${
              isFocused ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              maskImage: 'radial-gradient(circle at 45% 35%, black 20%, transparent 65%)',
              WebkitMaskImage: 'radial-gradient(circle at 45% 35%, black 20%, transparent 65%)',
            }}
          >
            <Image
              src="/images/my-photo.png"
              alt=""
              fill
              sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 360px"
              className="object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}
