import { processImage } from './process.js';
const DEFAULT_CONCURRENCY = 2;
/** Process a list of files through one shared image pipeline. */
export function createBatchProcessor(files, operations, options = {}) {
    const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
    if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 16) {
        throw new RangeError('concurrency must be an integer between 1 and 16');
    }
    const controller = new AbortController();
    const promise = run(files, operations, options, concurrency, controller.signal);
    return {
        promise,
        cancel(reason) {
            if (!controller.signal.aborted)
                controller.abort(reason);
        },
    };
}
async function run(files, operations, options, concurrency, signal) {
    const results = new Array(files.length);
    let nextIndex = 0;
    let completed = 0;
    let succeeded = 0;
    let failed = 0;
    let cancelled = 0;
    let active = 0;
    const emit = (phase, index, result) => {
        try {
            options.onProgress?.({
                phase, total: files.length, completed, succeeded, failed, cancelled, active,
                fraction: files.length === 0 ? 1 : completed / files.length,
                ...(index === undefined ? {} : { index, file: files[index] }),
                ...(result === undefined ? {} : { result }),
            });
        }
        catch {
            // A progress observer cannot interrupt the batch.
        }
    };
    emit('started');
    const worker = async () => {
        while (!signal.aborted) {
            const index = nextIndex++;
            if (index >= files.length)
                return;
            const file = files[index];
            active += 1;
            emit('started', index);
            let result;
            try {
                const blob = await processImage(file, operations, options);
                result = { index, file, status: 'success', blob };
                succeeded += 1;
            }
            catch (error) {
                result = { index, file, status: 'error', error };
                failed += 1;
            }
            active -= 1;
            results[index] = result;
            completed += 1;
            emit('completed', index, result);
        }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, worker));
    for (let index = 0; index < files.length; index += 1) {
        if (!results[index]) {
            const result = { index, file: files[index], status: 'cancelled' };
            results[index] = result;
            cancelled += 1;
            completed += 1;
            emit('completed', index, result);
        }
    }
    return {
        results: results, total: files.length, completed,
        succeeded, failed, cancelled, cancelledBySignal: signal.aborted,
    };
}
//# sourceMappingURL=batch.js.map