/** A work limit or unavailable worker must never be interpreted as a successful validation. */
export type RegexVerdict = 'valid' | 'match' | 'mismatch' | 'invalid' | 'timeout' | 'unavailable' | 'limit' | 'cancelled';

/** Minimal worker interface, also implemented by the Node conformance-test adapter. */
export interface RegexWorker {
  onmessage: ((event: { data: unknown }) => void) | null;
  onerror: (() => void) | null;
  postMessage(value: unknown): void;
  terminate(): void;
}

// The expression is always message data. Neither it nor its input is inserted into executable source.
export const REGEX_WORKER_SOURCE = `
  onmessage = ({data}) => {
    let result;
    try {
      const expression = new RegExp('^(?:' + data.pattern + ')$');
      result = data.value === null ? 'valid' : expression.test(data.value) ? 'match' : 'mismatch';
    } catch (_) { result = 'invalid'; }
    postMessage({id: data.id, result});
  };
  postMessage({ready: true});
`;

/** Structural AbortSignal subset; the policy declarations do not require DOM or Node types. */
export interface RegexCancellation {
  readonly aborted: boolean;
  addEventListener(type: 'abort', listener: () => void, options?: { once?: boolean }): void;
  removeEventListener(type: 'abort', listener: () => void): void;
}

export interface RegexPolicyOptions {
  /** A host may supply its own same-origin worker where CSP forbids blob workers. */
  workerFactory?: () => RegexWorker;
  workTimeoutMs?: number;
  startupTimeoutMs?: number;
  queueLimit?: number;
}

interface Job {
  id: number;
  pattern: string;
  value: string | null;
  finish: (result: RegexVerdict) => void;
}

/**
 * Serial, bounded evaluation in a disposable worker. Compilation is isolated too.
 * A timed-out worker is terminated, then the next request gets a fresh worker.
 * No synchronous fallback is permitted, including when a host's CSP blocks workers.
 */
export class RegexPolicy {
  private worker: RegexWorker | null = null;
  private ready = false;
  private releaseSource: (() => void) | null = null;
  private current: Job | null = null;
  private queue: Job[] = [];
  private serial = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private idleTimer: ReturnType<typeof setTimeout> | undefined;
  private closed = false;
  private readonly options: Required<RegexPolicyOptions>;

  public constructor(options: RegexPolicyOptions = {}) {
    this.options = {
      workerFactory:
        options.workerFactory ??
        (() => {
          const environment = globalThis as unknown as {
            Worker: new (url: string) => RegexWorker;
            Blob: new (parts: string[], options: { type: string }) => object;
            URL: { createObjectURL(blob: object): string; revokeObjectURL(url: string): void };
          };
          const url = environment.URL.createObjectURL(new environment.Blob([REGEX_WORKER_SOURCE], { type: 'text/javascript' }));
          // WebKit may fetch the source after Worker() returns. Keep it alive until
          // teardown, including constructor failure, cancellation and idle cleanup.
          this.releaseSource = () => environment.URL.revokeObjectURL(url);
          return new environment.Worker(url);
        }),
      workTimeoutMs: options.workTimeoutMs ?? 250,
      startupTimeoutMs: options.startupTimeoutMs ?? 5000,
      queueLimit: options.queueLimit ?? 1024,
    };
    for (const n of [this.options.workTimeoutMs, this.options.startupTimeoutMs, this.options.queueLimit])
      if (!Number.isSafeInteger(n) || n < 1) throw new RangeError('Regex limits must be positive integers');
  }

  public evaluate(pattern: string, value: string | null = null, signal?: RegexCancellation): Promise<RegexVerdict> {
    if (this.closed || signal?.aborted) return Promise.resolve('cancelled');
    // Bound messages and memory separately from execution time.
    if (pattern.length > 10000 || (value?.length ?? 0) > 1000000 || this.queue.length >= this.options.queueLimit)
      return Promise.resolve('limit');
    return new Promise((resolve) => {
      const job: Job = {
        id: ++this.serial,
        pattern,
        value,
        finish: (result) => {
          signal?.removeEventListener('abort', cancel);
          resolve(result);
        },
      };
      const cancel = () => {
        if (this.current === job) this.fail('cancelled');
        else {
          this.queue = this.queue.filter((queued) => queued !== job);
          job.finish('cancelled');
        }
      };
      signal?.addEventListener('abort', cancel, { once: true });
      this.queue.push(job);
      this.next();
    });
  }

  private stopWorker(): void {
    clearTimeout(this.timer);
    clearTimeout(this.idleTimer);
    if (this.worker) {
      this.worker.onmessage = null;
      this.worker.onerror = null;
      this.worker.terminate();
    }
    this.worker = null;
    this.ready = false;
    this.releaseSource?.();
    this.releaseSource = null;
  }

  private fail(result: RegexVerdict): void {
    this.stopWorker();
    const job = this.current;
    this.current = null;
    job?.finish(result);
    // Schedule instead of recursing if worker creation keeps failing.
    queueMicrotask(() => this.next());
  }

  private next(): void {
    if (this.closed || this.current || this.queue.length === 0) return;
    clearTimeout(this.idleTimer);
    this.current = this.queue.shift()!;
    if (this.worker && this.ready) {
      this.send();
      return;
    }
    try {
      const worker = this.options.workerFactory();
      this.worker = worker;
      this.timer = setTimeout(() => this.fail('unavailable'), this.options.startupTimeoutMs);
      worker.onerror = () => {
        if (this.worker === worker) this.fail('unavailable');
      };
      worker.onmessage = ({ data }) => {
        if (this.worker !== worker || !data || typeof data !== 'object') return;
        const response = data as { ready?: boolean; id?: number; result?: RegexVerdict };
        if (response.ready && !this.ready) {
          clearTimeout(this.timer);
          this.ready = true;
          this.send();
        } else if (response.id === this.current?.id && ['valid', 'match', 'mismatch', 'invalid'].includes(response.result ?? '')) {
          clearTimeout(this.timer);
          const job = this.current!;
          this.current = null;
          job.finish(response.result!);
          // Release idle workers without retaining an editor or document indefinitely.
          this.idleTimer = setTimeout(() => this.stopWorker(), 1000);
          this.next();
        }
      };
    } catch {
      this.fail('unavailable');
    }
  }

  private send(): void {
    if (!this.current || !this.worker) return;
    this.timer = setTimeout(() => this.fail('timeout'), this.options.workTimeoutMs);
    try {
      this.worker.postMessage({ id: this.current.id, pattern: this.current.pattern, value: this.current.value });
    } catch {
      this.fail('unavailable');
    }
  }

  public dispose(): void {
    this.closed = true;
    this.stopWorker();
    this.current?.finish('cancelled');
    this.current = null;
    this.queue.splice(0).forEach((job) => job.finish('cancelled'));
  }
}
