'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface CodingProfilesVideoBackgroundProps {
  src?: string;
  opacity?: string;
}

export default function CodingProfilesVideoBackground({
  src = 'https://stream.mux.com/Jwr2RhmsNrd6GEspBNgm02vJsRZAGlaoQIh4AucGdASw.m3u8',
  opacity = 'opacity-35',
}: CodingProfilesVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    // Bulletproof muted autoplay properties on DOM node
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('autoplay', '');

    const playVideo = () => {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Retry playback on user interaction if restricted by browser
          const resume = () => {
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          };
          window.addEventListener('click', resume, { once: true, passive: true });
          window.addEventListener('touchstart', resume, { once: true, passive: true });
        });
    };

    if (Hls.isSupported()) {
      // Primary engine: Chrome, Firefox, Edge, Android (MSE enabled)
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        playVideo();
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              hls?.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari on macOS & iOS WebKit (Native HLS)
      video.src = src;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      playVideo();
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          isPlaying ? opacity : 'opacity-25'
        }`}
      />
      {/* Top & Bottom seamless section blend gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0C0C0C] via-transparent to-[#0C0C0C] pointer-events-none" />
    </div>
  );
}
