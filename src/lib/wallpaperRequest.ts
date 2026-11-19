export class WallpaperTimeoutError extends Error {
    constructor() {
        super('Wallpaper request timed out');
        this.name = 'WallpaperTimeoutError';
    }
}

/** Bound the whole operation, including response-body reads, even if it ignores abort. */
export async function withWallpaperTimeout<T>(
    operation: (signal: AbortSignal) => PromiseLike<T>,
    timeoutMs: number,
    cancellation?: AbortSignal,
): Promise<T> {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let onAbort: (() => void) | undefined;
    const stopped = new Promise<never>((_, reject) => {
        onAbort = () => {
            const reason = cancellation?.reason ?? new DOMException('Aborted', 'AbortError');
            reject(reason);
            controller.abort(reason);
        };
        if (cancellation?.aborted) onAbort();
        else cancellation?.addEventListener('abort', onAbort, { once: true });
        timer = setTimeout(() => {
            const reason = new WallpaperTimeoutError();
            reject(reason);
            controller.abort(reason);
        }, timeoutMs);
    });
    try {
        return await Promise.race([
            stopped,
            Promise.resolve().then(() => {
                if (controller.signal.aborted) throw controller.signal.reason;
                return operation(controller.signal);
            }),
        ]);
    } finally {
        clearTimeout(timer);
        if (onAbort) cancellation?.removeEventListener('abort', onAbort);
    }
}
