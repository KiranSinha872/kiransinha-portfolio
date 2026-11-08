export type AspectRatio = '16:9' | '4:3' | '1:1' | 'free';
export type FitMode = 'cover' | 'contain';

export function getAspectRatioValue(aspectRatio: AspectRatio): number {
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
}

export interface RenderCropOptions {
  img: HTMLImageElement;
  aspectRatio: AspectRatio;
  fitMode: FitMode;
  zoom: number;
  rotation: number;
  bgColor: string;
  offset: { x: number; y: number };
  containerWidth: number;
  originalFileName?: string;
  originalFileType?: string;
}

export interface RenderCropResult {
  file: File;
  previewUrl: string;
}

export function renderCroppedImageBlob(options: RenderCropOptions): Promise<RenderCropResult> {
  const {
    img,
    aspectRatio,
    fitMode,
    zoom,
    rotation,
    bgColor,
    offset,
    containerWidth,
    originalFileName,
    originalFileType,
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to get 2d canvas context'));
      return;
    }

    let targetWidth = 1280;
    let targetHeight = Math.round(targetWidth / getAspectRatioValue(aspectRatio));

    if (aspectRatio === '1:1') {
      targetWidth = 800;
      targetHeight = 800;
    } else if (aspectRatio === '4:3') {
      targetWidth = 1200;
      targetHeight = 900;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    ctx.save();
    ctx.translate(targetWidth / 2, targetHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);

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
      const scale = Math.min(targetWidth / effectiveImgW, targetHeight / effectiveImgH) * zoom;
      renderW = imgNaturalW * scale;
      renderH = imgNaturalH * scale;
    }

    const containerW = containerWidth || 400;
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

    const originalMime = originalFileType || 'image/jpeg';
    const outputMime = originalMime === 'image/png' ? 'image/png' : 'image/jpeg';

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas export failed'));
          return;
        }
        const croppedFile = new File(
          [blob],
          originalFileName || `cropped-${Date.now()}.jpg`,
          { type: outputMime }
        );
        const previewUrl = canvas.toDataURL(outputMime, 0.9);
        resolve({ file: croppedFile, previewUrl });
      },
      outputMime,
      0.92
    );
  });
}
