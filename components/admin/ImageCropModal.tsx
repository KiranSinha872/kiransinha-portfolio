'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Check,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Crop,
} from 'lucide-react';

export type AspectRatio = '16:9' | '4:3' | '1:1' | 'free';
export type FitMode = 'cover' | 'contain';

interface ImageCropModalProps {
  isOpen: boolean;
  imageFile: File | null;
  initialAspectRatio?: AspectRatio;
  initialFitMode?: FitMode;
  title?: string;
  onCropComplete: (croppedFile: File, previewDataUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropModal({
  isOpen,
  imageFile,
  initialAspectRatio = '16:9',
  initialFitMode = 'cover',
  title = 'Crop & Fit Image',
  onCropComplete,
  onCancel,
}: ImageCropModalProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(initialAspectRatio);
  const [fitMode, setFitMode] = useState<FitMode>(initialFitMode);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [bgColor, setBgColor] = useState<string>('#f3f4f6'); // gray-100

  // Pan offsets
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load image when file changes
  useEffect(() => {
    if (!imageFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImgSrc('');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImgSrc(e.target?.result as string);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setAspectRatio(initialAspectRatio);
      setFitMode(initialFitMode);
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile, initialAspectRatio, initialFitMode]);

  // Handle Drag / Pan
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (fitMode === 'contain' && zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Calculate Aspect Ratio Dimensions in pixels for the preview frame
  const getAspectRatioValue = useCallback((): number => {
    switch (aspectRatio) {
      case '16:9':
        return 16 / 9;
      case '4:3':
        return 4 / 3;
      case '1:1':
        return 1 / 1;
      case 'free':
      default:
        return 16 / 9;
    }
  }, [aspectRatio]);

  // Generate cropped image from canvas
  const handleApplyCrop = async () => {
    if (!imgSrc || !imageRef.current) return;

    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Target Canvas Output Dimensions based on aspect ratio
    let targetWidth = 1280;
    let targetHeight = Math.round(targetWidth / getAspectRatioValue());

    if (aspectRatio === '1:1') {
      targetWidth = 800;
      targetHeight = 800;
    } else if (aspectRatio === '4:3') {
      targetWidth = 1200;
      targetHeight = 900;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Background fill
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    ctx.save();
    // Center transformations
    ctx.translate(targetWidth / 2, targetHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Compute base draw dimensions
    const imgNaturalW = img.naturalWidth;
    const imgNaturalH = img.naturalHeight;
    const isRotated = rotation % 180 !== 0;
    const effectiveImgW = isRotated ? imgNaturalH : imgNaturalW;
    const effectiveImgH = isRotated ? imgNaturalW : imgNaturalH;

    let renderW = targetWidth;
    let renderH = targetHeight;

    if (fitMode === 'cover') {
      const scale = Math.max(targetWidth / effectiveImgW, targetHeight / effectiveImgH) * zoom;
      renderW = imgNaturalW * scale;
      renderH = imgNaturalH * scale;
    } else {
      // Contain mode (fit entire image inside container)
      const scale = Math.min(targetWidth / effectiveImgW, targetHeight / effectiveImgH) * zoom;
      renderW = imgNaturalW * scale;
      renderH = imgNaturalH * scale;
    }

    // Scale offset relative to container size vs target canvas size
    const containerW = containerRef.current?.clientWidth || 400;
    const scaleFactor = targetWidth / containerW;
    const offsetX = offset.x * scaleFactor;
    const offsetY = offset.y * scaleFactor;

    ctx.drawImage(
      img,
      -renderW / 2 + offsetX,
      -renderH / 2 + offsetY,
      renderW,
      renderH
    );
    ctx.restore();

    // Export as high quality JPEG/PNG
    const originalMime = imageFile?.type || 'image/jpeg';
    const outputMime = originalMime === 'image/png' ? 'image/png' : 'image/jpeg';

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File(
          [blob],
          imageFile?.name || `cropped-${Date.now()}.jpg`,
          { type: outputMime }
        );
        const previewUrl = canvas.toDataURL(outputMime, 0.9);
        onCropComplete(croppedFile, previewUrl);
      },
      outputMime,
      0.92
    );
  };

  if (!isOpen || !imageFile || !imgSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-2xl bg-white border border-gray-300 rounded shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Crop className="w-4 h-4 text-gray-700" />
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Crop Area */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 flex flex-col items-center justify-center">
          {/* Viewport Frame with Aspect Ratio */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              aspectRatio: `${getAspectRatioValue()}`,
              backgroundColor: bgColor,
            }}
            className="relative w-full max-w-md rounded overflow-hidden border border-gray-300 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
          >
            {/* Grid overlay for cropping guide */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-gray-300 opacity-40 z-10">
              <div className="border-r border-b border-gray-400" />
              <div className="border-r border-b border-gray-400" />
              <div className="border-b border-gray-400" />
              <div className="border-r border-b border-gray-400" />
              <div className="border-r border-b border-gray-400" />
              <div className="border-b border-gray-400" />
              <div className="border-r border-gray-400" />
              <div className="border-r border-gray-400" />
              <div />
            </div>

            {/* Target Image with Transformations */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imgSrc}
              alt="Crop target"
              draggable={false}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                objectFit: fitMode === 'cover' ? 'cover' : 'contain',
                maxWidth: fitMode === 'contain' ? '100%' : 'none',
                maxHeight: fitMode === 'contain' ? '100%' : 'none',
              }}
              className="pointer-events-none origin-center"
            />
          </div>

          <span className="text-[11px] text-gray-500">
            Drag on the image to pan / reposition within frame
          </span>

          {/* Controls Bar */}
          <div className="w-full space-y-3 pt-2 text-xs">
            {/* Aspect Ratio & Fit Mode */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <span className="text-gray-500 mr-1">Aspect:</span>
                {(['16:9', '4:3', '1:1'] as AspectRatio[]).map((ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => setAspectRatio(ar)}
                    className={`px-2 py-1 rounded border text-xs ${
                      aspectRatio === ar
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>

              {/* Fit Mode */}
              <div className="flex items-center gap-1">
                <span className="text-gray-500 mr-1">Fit:</span>
                <button
                  type="button"
                  onClick={() => {
                    setFitMode('cover');
                    setOffset({ x: 0, y: 0 });
                  }}
                  className={`px-2 py-1 rounded border text-xs ${
                    fitMode === 'cover'
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  Fill & Crop
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFitMode('contain');
                    setOffset({ x: 0, y: 0 });
                  }}
                  className={`px-2 py-1 rounded border text-xs ${
                    fitMode === 'contain'
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  Fit Entire
                </button>
              </div>
            </div>

            {/* Zoom Slider and Rotation */}
            <div className="flex items-center justify-between gap-3 p-2 border border-gray-200 rounded bg-gray-50">
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <ZoomOut className="w-3.5 h-3.5 text-gray-500" />
                <input
                  type="range"
                  min="0.8"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full cursor-pointer"
                />
                <ZoomIn className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[10px] font-mono text-gray-600 w-8">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                {fitMode === 'contain' && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500">Backdrop:</span>
                    <button
                      type="button"
                      onClick={() => setBgColor('#ffffff')}
                      className={`w-4 h-4 rounded-full border ${
                        bgColor === '#ffffff' ? 'border-gray-900' : 'border-gray-300'
                      } bg-white`}
                      title="White"
                    />
                    <button
                      type="button"
                      onClick={() => setBgColor('#f3f4f6')}
                      className={`w-4 h-4 rounded-full border ${
                        bgColor === '#f3f4f6' ? 'border-gray-900' : 'border-gray-300'
                      } bg-gray-100`}
                      title="Light Gray"
                    />
                    <button
                      type="button"
                      onClick={() => setBgColor('#111827')}
                      className={`w-4 h-4 rounded-full border ${
                        bgColor === '#111827' ? 'border-gray-900' : 'border-gray-300'
                      } bg-gray-900`}
                      title="Dark"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="p-1 border border-gray-300 bg-white rounded text-gray-700 hover:bg-gray-100"
                  title="Rotate 90 degrees"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-900 bg-gray-900 text-white font-medium rounded hover:bg-gray-800"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Image</span>
          </button>
        </div>
      </div>
    </div>
  );
}
