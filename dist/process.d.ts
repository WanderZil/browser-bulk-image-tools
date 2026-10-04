import type { ImageOperation, ProcessOptions } from './types.js';
/** Apply a sequence of image operations and encode one output Blob. */
export declare function processImage(source: Blob, operations: readonly ImageOperation[], options?: ProcessOptions): Promise<Blob>;
//# sourceMappingURL=process.d.ts.map