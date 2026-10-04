export type OutputFormat = 'keep' | 'image/jpeg' | 'image/png' | 'image/webp';
export type ResizeMode = 'contain' | 'cover' | 'stretch';
export type WatermarkPosition = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type ImageOperation = {
    type: 'resize';
    width?: number;
    height?: number;
    mode?: ResizeMode;
    preventUpscale?: boolean;
    background?: string;
} | {
    type: 'crop';
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: 'rotate';
    degrees: number;
    background?: string;
} | {
    type: 'flip';
    horizontal?: boolean;
    vertical?: boolean;
} | {
    type: 'watermark';
    text: string;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    opacity?: number;
    position?: WatermarkPosition;
    margin?: number;
};
export interface ProcessOptions {
    /** Output format. `keep` retains JPEG, PNG, or WebP and uses PNG otherwise. */
    format?: OutputFormat;
    /** JPEG/WebP quality from 0 to 1. Defaults to 0.9. */
    quality?: number;
}
export interface BatchProgress {
    phase: 'started' | 'completed';
    total: number;
    completed: number;
    succeeded: number;
    failed: number;
    cancelled: number;
    active: number;
    fraction: number;
    index?: number;
    file?: File;
    result?: BatchItemResult;
}
export interface BatchItemResult {
    index: number;
    file: File;
    status: 'success' | 'error' | 'cancelled';
    blob?: Blob;
    error?: unknown;
}
export interface BatchResult {
    results: readonly BatchItemResult[];
    total: number;
    completed: number;
    succeeded: number;
    failed: number;
    cancelled: number;
    cancelledBySignal: boolean;
}
export interface BatchOptions extends ProcessOptions {
    concurrency?: number;
    onProgress?: (progress: BatchProgress) => void;
}
export interface BatchHandle {
    promise: Promise<BatchResult>;
    cancel(reason?: string): void;
}
//# sourceMappingURL=types.d.ts.map