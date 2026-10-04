import { assertCanvasSize, canvasToBlob, context2d, makeCanvas, type BrowserCanvas } from './canvas.js';
import type { ImageOperation, OutputFormat, ProcessOptions, WatermarkPosition } from './types.js';

function resolveMime(source: Blob, format: OutputFormat = 'keep'): string {
  if (format !== 'keep') return format;
  return ['image/jpeg', 'image/png', 'image/webp'].includes(source.type) ? source.type : 'image/png';
}

function paintBackground(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, color?: string): void {
  if (!color || color === 'transparent') return;
  context.fillStyle = color;
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
}

function applyResize(source: BrowserCanvas, operation: Extract<ImageOperation, { type: 'resize' }>): BrowserCanvas {
  const width = operation.width;
  const height = operation.height;
  if (width === undefined && height === undefined) throw new TypeError('Resize requires width, height, or both');
  if (width !== undefined && (!Number.isInteger(width) || width < 1)) throw new RangeError('Resize width must be a positive integer');
  if (height !== undefined && (!Number.isInteger(height) || height < 1)) throw new RangeError('Resize height must be a positive integer');
  const sourceWidth = source.width;
  const sourceHeight = source.height;
  const mode = operation.mode ?? 'contain';
  const preventUpscale = operation.preventUpscale ?? true;
  let outputWidth: number;
  let outputHeight: number;

  if (mode === 'stretch') {
    if (width === undefined || height === undefined) throw new TypeError('Stretch resize requires both width and height');
    outputWidth = preventUpscale ? Math.min(width, sourceWidth) : width;
    outputHeight = preventUpscale ? Math.min(height, sourceHeight) : height;
  } else if (mode === 'cover') {
    if (width === undefined || height === undefined) throw new TypeError('Cover resize requires both width and height');
    outputWidth = width;
    outputHeight = height;
  } else {
    const scale = Math.min(
      width === undefined ? Number.POSITIVE_INFINITY : width / sourceWidth,
      height === undefined ? Number.POSITIVE_INFINITY : height / sourceHeight,
    );
    const boundedScale = preventUpscale ? Math.min(1, scale) : scale;
    outputWidth = Math.max(1, Math.round(sourceWidth * boundedScale));
    outputHeight = Math.max(1, Math.round(sourceHeight * boundedScale));
  }

  assertCanvasSize(outputWidth, outputHeight);
  const output = makeCanvas(outputWidth, outputHeight);
  const context = context2d(output);
  paintBackground(context, operation.background);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  if (mode === 'cover' && width !== undefined && height !== undefined) {
    const scale = Math.max(outputWidth / sourceWidth, outputHeight / sourceHeight);
    const drawnWidth = sourceWidth * scale;
    const drawnHeight = sourceHeight * scale;
    context.drawImage(source, (outputWidth - drawnWidth) / 2, (outputHeight - drawnHeight) / 2, drawnWidth, drawnHeight);
  } else {
    context.drawImage(source, 0, 0, outputWidth, outputHeight);
  }
  return output;
}

function applyCrop(source: BrowserCanvas, operation: Extract<ImageOperation, { type: 'crop' }>): BrowserCanvas {
  const { x, y, width, height } = operation;
  if (![x, y, width, height].every(Number.isFinite) || x < 0 || y < 0 || width < 1 || height < 1) {
    throw new RangeError('Crop coordinates and dimensions must be positive finite values');
  }
  if (x + width > source.width || y + height > source.height) {
    throw new RangeError('Crop region must fit inside the current image');
  }
  const outputWidth = Math.round(width);
  const outputHeight = Math.round(height);
  const output = makeCanvas(outputWidth, outputHeight);
  context2d(output).drawImage(source, x, y, width, height, 0, 0, outputWidth, outputHeight);
  return output;
}

function applyRotate(source: BrowserCanvas, operation: Extract<ImageOperation, { type: 'rotate' }>): BrowserCanvas {
  if (!Number.isFinite(operation.degrees)) throw new TypeError('Rotation degrees must be finite');
  const radians = (operation.degrees * Math.PI) / 180;
  const boundsWidth = Math.abs(source.width * Math.cos(radians)) + Math.abs(source.height * Math.sin(radians));
  const boundsHeight = Math.abs(source.width * Math.sin(radians)) + Math.abs(source.height * Math.cos(radians));
  const outputWidth = Math.max(1, Math.ceil(boundsWidth - 1e-10));
  const outputHeight = Math.max(1, Math.ceil(boundsHeight - 1e-10));
  const output = makeCanvas(outputWidth, outputHeight);
  const context = context2d(output);
  paintBackground(context, operation.background);
  context.translate(outputWidth / 2, outputHeight / 2);
  context.rotate(radians);
  context.drawImage(source, -source.width / 2, -source.height / 2);
  return output;
}

function applyFlip(source: BrowserCanvas, operation: Extract<ImageOperation, { type: 'flip' }>): BrowserCanvas {
  const horizontal = operation.horizontal ?? false;
  const vertical = operation.vertical ?? false;
  if (!horizontal && !vertical) return source;
  const output = makeCanvas(source.width, source.height);
  const context = context2d(output);
  context.translate(horizontal ? source.width : 0, vertical ? source.height : 0);
  context.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
  context.drawImage(source, 0, 0);
  return output;
}

function watermarkOrigin(position: WatermarkPosition, width: number, height: number, margin: number): { x: number; y: number; align: CanvasTextAlign; baseline: CanvasTextBaseline } {
  const horizontal = position.endsWith('left') ? 'left' : position.endsWith('right') ? 'right' : 'center';
  const vertical = position.startsWith('top') ? 'top' : position.startsWith('bottom') ? 'bottom' : 'center';
  return {
    x: horizontal === 'left' ? margin : horizontal === 'right' ? width - margin : width / 2,
    y: vertical === 'top' ? margin : vertical === 'bottom' ? height - margin : height / 2,
    align: horizontal,
    baseline: vertical === 'top' ? 'top' : vertical === 'bottom' ? 'bottom' : 'middle',
  };
}

function applyWatermark(source: BrowserCanvas, operation: Extract<ImageOperation, { type: 'watermark' }>): BrowserCanvas {
  if (!operation.text.trim()) throw new TypeError('Watermark text cannot be empty');
  const fontSize = operation.fontSize ?? Math.max(16, Math.round(Math.min(source.width, source.height) * 0.04));
  const margin = operation.margin ?? Math.max(12, Math.round(fontSize * 0.75));
  const opacity = operation.opacity ?? 0.7;
  if (!Number.isFinite(fontSize) || fontSize < 1 || !Number.isFinite(margin) || margin < 0) {
    throw new RangeError('Watermark fontSize and margin must be valid positive values');
  }
  if (!Number.isFinite(opacity) || opacity < 0 || opacity > 1) throw new RangeError('Watermark opacity must be between 0 and 1');
  const output = makeCanvas(source.width, source.height);
  const context = context2d(output);
  context.drawImage(source, 0, 0);
  const origin = watermarkOrigin(operation.position ?? 'bottom-right', source.width, source.height, margin);
  context.globalAlpha = opacity;
  context.fillStyle = operation.color ?? '#ffffff';
  context.font = `${fontSize}px ${operation.fontFamily ?? 'sans-serif'}`;
  context.textAlign = origin.align;
  context.textBaseline = origin.baseline;
  context.shadowColor = 'rgba(0, 0, 0, 0.55)';
  context.shadowBlur = Math.max(1, Math.round(fontSize * 0.12));
  context.fillText(operation.text, origin.x, origin.y);
  return output;
}

function applyOperation(source: BrowserCanvas, operation: ImageOperation): BrowserCanvas {
  switch (operation.type) {
    case 'resize': return applyResize(source, operation);
    case 'crop': return applyCrop(source, operation);
    case 'rotate': return applyRotate(source, operation);
    case 'flip': return applyFlip(source, operation);
    case 'watermark': return applyWatermark(source, operation);
  }
}

/** Apply a sequence of image operations and encode one output Blob. */
export async function processImage(source: Blob, operations: readonly ImageOperation[], options: ProcessOptions = {}): Promise<Blob> {
  const format = options.format ?? 'keep';
  const quality = options.quality ?? 0.9;
  if (!['keep', 'image/jpeg', 'image/png', 'image/webp'].includes(format)) throw new TypeError(`Unsupported image output format: ${format}`);
  if (!Number.isFinite(quality) || quality < 0 || quality > 1) throw new RangeError('quality must be between 0 and 1');

  const bitmap = await createImageBitmap(source);
  try {
    let current = makeCanvas(bitmap.width, bitmap.height);
    context2d(current).drawImage(bitmap, 0, 0);
    for (const operation of operations) current = applyOperation(current, operation);
    const mime = resolveMime(source, format);
    const context = context2d(current);
    if (mime === 'image/jpeg') {
      context.globalCompositeOperation = 'destination-over';
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, current.width, current.height);
      context.globalCompositeOperation = 'source-over';
    }
    const blob = await canvasToBlob(current, mime, quality);
    if (blob.type !== mime) throw new Error(`This browser cannot encode ${mime}`);
    return blob;
  } finally {
    bitmap.close();
  }
}
