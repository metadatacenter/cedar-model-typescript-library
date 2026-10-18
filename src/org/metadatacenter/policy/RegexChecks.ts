import { RegexPolicy, RegexVerdict } from './RegexPolicy';

interface Check {
  result: RegexVerdict | 'pending';
  controller: AbortController;
  done: Promise<void>;
}

/**
 * A document's current checks. A synchronous report can say "pending" while the
 * worker runs; its owner gets a callback when the current batch has settled.
 * Each run retains only the checks it used, cancelling obsolete values and
 * freeing old answers. Owners must never advertise pending checks as valid.
 */
export class RegexChecks {
  private readonly entries = new Map<string, Check>();
  private used: Set<string> | null = null;
  private size = 0;
  private disposed = false;
  private capacityLimited = false;
  private static active: RegexChecks | null = null;

  public constructor(
    private readonly changed: () => void = () => {},
    private readonly policy = new RegexPolicy(),
  ) {}

  /** Scope is synchronous and restored even if a validator throws. Never pass an async callback. */
  public run<T>(validate: () => T): T {
    if (this.used) return validate();
    const before = RegexChecks.active;
    RegexChecks.active = this;
    this.used = new Set();
    this.capacityLimited = false;
    try {
      return validate();
    } finally {
      const keep = this.used;
      this.used = null;
      RegexChecks.active = before;
      let pruned = false;
      for (const [key, entry] of this.entries)
        if (!keep.has(key)) {
          pruned = true;
          this.entries.delete(key);
          this.size -= key.length;
          entry.controller.abort();
        }
      if (pruned && this.capacityLimited)
        queueMicrotask(() => {
          if (!this.disposed) this.changed();
        });
    }
  }

  /** Outside a report scope the verdict is explicitly pending, never a successful validation. */
  public static inspect(pattern: string, value: string | null = null): RegexVerdict | 'pending' {
    return this.active?.check(pattern, value) ?? 'pending';
  }

  private check(pattern: string, value: string | null): RegexVerdict | 'pending' {
    if (this.disposed) return 'cancelled';
    if (pattern.length > 10000 || (value?.length ?? 0) > 1000000) return 'limit';
    const key = JSON.stringify([pattern, value]);
    this.used!.add(key);
    const previous = this.entries.get(key);
    if (previous) return previous.result;
    // Bound retained state as well as the worker queue. No cache eviction/revalidation loop.
    if (this.entries.size >= 1024 || this.size + key.length > 4_000_000) {
      this.capacityLimited = true;
      return 'limit';
    }
    const controller = new AbortController();
    const entry: Check = { result: 'pending', controller, done: Promise.resolve() };
    this.entries.set(key, entry);
    this.size += key.length;
    entry.done = this.policy.evaluate(pattern, value, controller.signal).then((result) => {
      if (this.disposed || this.entries.get(key) !== entry) return;
      entry.result = result;
      if (!this.pending) this.changed();
    });
    return 'pending';
  }

  public get pending(): boolean {
    return [...this.entries.values()].some((entry) => entry.result === 'pending');
  }

  public async settled(): Promise<void> {
    await Promise.all([...this.entries.values()].map((entry) => entry.done));
  }

  /** Useful at an asynchronous validation boundary, including headless consumers. */
  public static async validate<T>(validate: () => T, policy?: RegexPolicy): Promise<T> {
    const checks = new RegexChecks(undefined, policy);
    try {
      let result = checks.run(validate);
      while (checks.pending) {
        await checks.settled();
        result = checks.run(validate);
      }
      return result;
    } finally {
      checks.dispose();
    }
  }

  public dispose(): void {
    this.disposed = true;
    for (const entry of this.entries.values()) entry.controller.abort();
    this.entries.clear();
    this.size = 0;
    this.policy.dispose();
  }
}
