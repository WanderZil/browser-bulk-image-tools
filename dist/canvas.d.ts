export declare const MAX_DIMENSION = 16384;
export declare const MAX_PIXELS = 100000000;
export type BrowserCanvas = OffscreenCanvas | HTMLCanvasElement;
export type Canvas2D = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
export declare function assertCanvasSize(width: number, height: number): void;
export declare function makeCanvas(width: number, height: number): BrowserCanvas;
export declare function context2d(canvas: BrowserCanvas): Canvas2D;
export declare function canvasToBlob(canvas: BrowserCanvas, type: string, quality: number): Promise<Blob>;
//# sourceMappingURL=canvas.d.ts.map