'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    THREE: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    VANTA: any;
  }
}

export default function HeroBirdsBackground() {
  const vantaRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const effectRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;

    const tryInit = () => {
      if (!isMounted || effectRef.current || !vantaRef.current) return;

      if (typeof window !== 'undefined' && window.THREE && window.VANTA?.BIRDS) {
        try {
          effectRef.current = window.VANTA.BIRDS({
            el: vantaRef.current,
            THREE: window.THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            backgroundColor: 0x0c0c0c,
            color1: 0x615858,
            color2: 0x1090c,
            birdSize: 1.8,
            wingSpan: 22.0,
            speedLimit: 4.0,
            separation: 48.0,
            alignment: 49.0,
            cohesion: 26.0,
            quantity: 3.0,
          });
          setIsLoaded(true);
        } catch (err) {
          console.warn('Vanta Birds initialization attempt:', err);
          timer = setTimeout(tryInit, 200);
        }
      } else {
        // Retry until Three.js and Vanta scripts finish loading
        timer = setTimeout(tryInit, 100);
      }
    };

    tryInit();

    const handleResize = () => {
      if (effectRef.current?.resize) {
        effectRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (effectRef.current) {
        try {
          effectRef.current.destroy();
        } catch {
          // Cleanup error suppression
        }
        effectRef.current = null;
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* Vanta Canvas Host Container with subtle ambient opacity */}
      <div
        ref={vantaRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
          isLoaded ? 'opacity-35' : 'opacity-0'
        }`}
      />

      {/* Top, Bottom & Radial Dark Gradient Overlays for Seamless Page Blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0C0C0C]/80 via-transparent to-[#0C0C0C] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0C0C0C_85%)] pointer-events-none" />
    </div>
  );
}
