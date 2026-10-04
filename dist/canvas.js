export const MAX_DIMENSION = 16_384;
export const MAX_PIXELS = 100_000_000;
export function assertCanvasSize(width, height) {
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
        throw new RangeError('Image dimensions must be positive integers');
    }
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        throw new RangeError(`Image dimensions cannot exceed ${MAX_DIMENSION} pixels per side`);
    }
    if (width * height > MAX_PIXELS) {
        throw new RangeError(`Images cannot exceed ${MAX_PIXELS} pixels`);
    }
}
export function makeCanvas(width, height) {
    assertCanvasSize(width, height);
    if (typeof OffscreenCanvas !== 'undefined')
        return new OffscreenCanvas(width, height);
    if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
    throw new Error('Image processing requires OffscreenCanvas or a browser document');
}
export function context2d(canvas) {
    const context = canvas.getContext('2d');
    if (!context)
        throw new Error('Could not create a 2D canvas context');
    return context;
}
export function canvasToBlob(canvas, type, quality) {
    if ('convertToBlob' in canvas)
        return canvas.convertToBlob({ type, quality });
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error(`Could not encode ${type}`)), type, quality);
    });
}
//# sourceMappingURL=canvas.js.map