'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsBackgroundVideoProps {
  src: string;
  className?: string;
  opacityClassName?: string;
}

export default function HlsBackgroundVideo({
  src,
  className = 'w-full h-full object-cover object-center',
  opacityClassName = 'opacity-30',
}: HlsBackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        autoStartLoad: true,
        startLevel: -1,
        capLevelToPlayerSize: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          // Autoplay was prevented or postponed
        });
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`${className} ${opacityClassName} filter contrast-110 brightness-90`}
      />

      {/* Top, Bottom & Radial Dark Gradient Overlays for Seamless Page Blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0C0C0C] via-transparent to-[#0C0C0C]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,#0C0C0C_85%)]" />
    </div>
  );
}
