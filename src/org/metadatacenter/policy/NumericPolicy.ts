export type NumericValue = number | ExactDecimal;
export type NumericInput = NumericValue | string;

interface DecimalParts {
  sign: -1 | 0 | 1;
  digits: string;
  exponent: bigint;
}

/** An exact decimal when a JavaScript number cannot carry the source value. */
export class ExactDecimal {
  public readonly cedarExactDecimal = true;

  /** CED and CEE may bundle independent copies of this package. */
  public static isExact(value: unknown): value is ExactDecimal {
    return (
      value !== null &&
      typeof value === 'object' &&
      (value as ExactDecimal).cedarExactDecimal === true &&
      typeof (value as ExactDecimal).toJSON === 'function'
    );
  }

  private constructor(private readonly text: string) {
    Object.freeze(this);
  }

  public static forValue(value: string): ExactDecimal {
    return new ExactDecimal(NumericPolicy.canonical(value));
  }

  public toString(): string {
    return this.text;
  }

  public valueOf(): never {
    throw new Error('Use NumericPolicy.compare for exact decimals; implicit numeric coercion would lose precision.');
  }

  /** Modern native JSON serialization is exact; older engines must use JsonSourcePolicy.stringify. */
  public toJSON(): unknown {
    const rawJSON = (JSON as unknown as { rawJSON?: (text: string) => unknown }).rawJSON;
    if (!rawJSON) throw new Error('Use JsonSourcePolicy.stringify to serialize exact decimal numbers.');
    return rawJSON(this.text);
  }
}

/** Locale-independent ASCII decimal grammar and comparisons without binary floating-point conversion. */
export class NumericPolicy {
  private static parts(value: NumericInput): DecimalParts {
    const text = typeof value === 'string' ? value : String(value);
    const match = /^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?$/.exec(text);
    if (!match) throw new Error('Expected a finite decimal number without surrounding whitespace.');
    const fraction = match[3] ?? match[4] ?? '';
    const statedExponent = BigInt(match[5] ?? '0');
    let exponent = statedExponent - BigInt(fraction.length);
    if (statedExponent < -2147483647n || statedExponent > 2147483647n || exponent < -2147483647n || exponent > 2147483648n)
      throw new Error('Decimal exponent or scale is outside the shared numeric range.');
    let digits = ((match[2] ?? '') + fraction).replace(/^0+/, '');
    if (!digits) return { sign: 0, digits: '0', exponent: 0n };
    const zeros = /0+$/.exec(digits)?.[0].length ?? 0;
    if (zeros) {
      digits = digits.slice(0, -zeros);
      exponent += BigInt(zeros);
    }
    return { sign: match[1] === '-' ? -1 : 1, digits, exponent };
  }

  public static canonical(value: NumericInput): string {
    const { sign, digits, exponent } = this.parts(value);
    if (!sign) return '0';
    const prefix = sign < 0 ? '-' : '';
    const adjusted = exponent + BigInt(digits.length - 1);
    if (exponent >= 0n && adjusted < 1000n) return prefix + digits + '0'.repeat(Number(exponent));
    if (exponent < 0n && adjusted >= -1000n) {
      const point = digits.length + Number(exponent);
      return prefix + (point > 0 ? digits.slice(0, point) + '.' + digits.slice(point) : '0.' + '0'.repeat(-point) + digits);
    }
    if (adjusted > 2147483647n) {
      const extra = exponent - 2147483647n;
      return prefix + digits + (extra > 0n ? '0'.repeat(Number(extra)) : '') + 'E+' + (extra > 0n ? 2147483647n : exponent);
    }
    return prefix + digits[0] + (digits.length > 1 ? '.' + digits.slice(1) : '') + 'E' + (adjusted >= 0n ? '+' : '') + adjusted;
  }

  public static compare(left: NumericInput, right: NumericInput): -1 | 0 | 1 {
    const a = this.parts(left),
      b = this.parts(right);
    if (a.sign !== b.sign) return a.sign < b.sign ? -1 : 1;
    if (!a.sign) return 0;
    const am = BigInt(a.digits.length) + a.exponent,
      bm = BigInt(b.digits.length) + b.exponent;
    let order: number;
    if (am !== bm) order = am < bm ? -1 : 1;
    else {
      const length = Math.max(a.digits.length, b.digits.length);
      const av = a.digits.padEnd(length, '0'),
        bv = b.digits.padEnd(length, '0');
      order = av === bv ? 0 : av < bv ? -1 : 1;
    }
    return (order === 0 ? 0 : order * a.sign) as -1 | 0 | 1;
  }

  public static isInteger(value: NumericInput): boolean {
    return this.parts(value).exponent >= 0n;
  }

  public static fractionalDigits(value: NumericInput): number {
    return Math.max(0, -Number(this.parts(value).exponent));
  }

  /** Existing number callers remain supported; raw text retains all digits when a double cannot. */
  public static value(value: NumericInput): NumericValue {
    if (ExactDecimal.isExact(value)) return value;
    this.parts(value);
    if (typeof value === 'number') return value;
    const approximate = Number(value);
    if (
      Number.isFinite(approximate) &&
      (!Number.isInteger(approximate) || Number.isSafeInteger(approximate)) &&
      this.compare(value, approximate) === 0
    )
      return approximate;
    return ExactDecimal.forValue(value);
  }
}
