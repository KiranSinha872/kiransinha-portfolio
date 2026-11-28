'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface InteractivePortraitProps {
  onOpenDevCard?: () => void;
}

export interface PortraitPart {
  id: string;
  name: string;
  val: number;
}

export const PORTRAIT_PARTS: PortraitPart[] = [
  { id: 'hair', name: 'Hair', val: 1 },
  { id: 'face_skin', name: 'Face & Skin', val: 2 },
  { id: 'shirt', name: 'Shirt', val: 3 },
  { id: 'tie', name: 'Tie', val: 4 },
  { id: 'jacket', name: 'Jacket', val: 5 },
  { id: 'trousers', name: 'Trousers', val: 6 },
];

export default function InteractivePortrait({ onOpenDevCard }: InteractivePortraitProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [lockedParts, setLockedParts] = useState<Set<string>>(new Set());
  const [hitmapData, setHitmapData] = useState<Uint8ClampedArray | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const keyboardNavRef = useRef<HTMLDivElement | null>(null);
  const prefersReduced = useReducedMotion();

  // Load hitmap into memory once for instant O(1) hit testing
  useEffect(() => {
    const img = new window.Image();
    img.src = '/images/portrait-parts/hitmap.png';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 515;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, 515, 1024);
        setHitmapData(imgData.data);
      }
    };
  }, []);

  // Helper to determine part under cursor
  const getPartFromEvent = useCallback(
    (clientX: number, clientY: number): string | null => {
      if (!hitmapData || !containerRef.current) return null;
      const rect = containerRef.current.getBoundingClientRect();
      const relX = clientX - rect.left;
      const relY = clientY - rect.top;

      if (relX < 0 || relX >= rect.width || relY < 0 || relY >= rect.height) {
        return null;
      }

      const imgX = Math.floor((relX / rect.width) * 515);
      const imgY = Math.floor((relY / rect.height) * 1024);

      if (imgX < 0 || imgX >= 515 || imgY < 0 || imgY >= 1024) {
        return null;
      }

      const idx = (imgY * 515 + imgX) * 4;
      const val = hitmapData[idx]; // R channel holds 0..6
      if (val === 0) return null;

      const part = PORTRAIT_PARTS.find((p) => p.val === val);
      return part ? part.id : null;
    },
    [hitmapData]
  );

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const part = getPartFromEvent(e.clientX, e.clientY);
    setHoveredPart(part);
  };

  const handlePointerLeave = () => {
    setHoveredPart(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const part = getPartFromEvent(e.clientX, e.clientY);
    // Clicking empty space does nothing
    if (!part) return;

    setLockedParts((prev) => {
      const next = new Set(prev);
      if (next.has(part)) {
        next.delete(part); // unlock
      } else {
        next.add(part); // lock
      }
      return next;
    });
  };

  const togglePartLock = (partId: string) => {
    setLockedParts((prev) => {
      const next = new Set(prev);
      if (next.has(partId)) {
        next.delete(partId);
      } else {
        next.add(partId);
      }
      return next;
    });
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Interactive Cut-Out Portrait Container */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        className="relative w-[280px] sm:w-[320px] lg:w-[360px] aspect-[515/1024] cursor-crosshair select-none"
        title="Hover to highlight parts • Click to lock colour"
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

        {/* Color Part Layers: Each part smoothly fades to full real color when hovered or locked */}
        {PORTRAIT_PARTS.map((part) => {
          const isVisible = hoveredPart === part.id || lockedParts.has(part.id);

          return (
            <div
              key={part.id}
              id={`portrait-part-${part.id}`}
              className={`absolute inset-0 pointer-events-none ${
                prefersReduced
                  ? 'transition-none'
                  : 'transition-opacity duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]'
              }`}
              style={{
                opacity: isVisible ? 1 : 0,
              }}
              aria-hidden="true"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/portrait-parts/${part.id}.png`}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
          );
        })}
      </div>

      {/* Accessible Keyboard Controls & Part Badges */}
      <div
        ref={keyboardNavRef}
        role="toolbar"
        aria-label="Portrait interactive parts"
        className="mt-4 flex flex-wrap items-center justify-center gap-1.5 max-w-[340px]"
      >
        {PORTRAIT_PARTS.map((part) => {
          const isLocked = lockedParts.has(part.id);
          const isHovered = hoveredPart === part.id;

          return (
            <button
              key={part.id}
              type="button"
              role="checkbox"
              aria-checked={isLocked}
              aria-label={`${part.name}: ${isLocked ? 'Locked in color' : 'Greyscale'}. Press Enter to toggle.`}
              onClick={(e) => {
                e.stopPropagation();
                togglePartLock(part.id);
              }}
              onFocus={() => setHoveredPart(part.id)}
              onBlur={() => setHoveredPart(null)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658] ${
                isLocked
                  ? 'bg-[#0B7658] text-white border border-[#0B7658] font-bold shadow-xs'
                  : isHovered
                  ? 'bg-[var(--foreground)] text-[var(--background)] border border-[var(--foreground)] font-medium'
                  : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--line)]'
              }`}
            >
              <span>{part.name}</span>
              {isLocked && <span className="ml-1 text-[10px]">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
