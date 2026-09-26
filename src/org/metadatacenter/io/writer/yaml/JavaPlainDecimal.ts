/**
 * Java 17 Double.toString digits, expanded like BigDecimal.stripTrailingZeros().toPlainString().
 *
 * ECMAScript permits midpoint spellings that Java 17 omits (for example 1e23), and the
 * older JDK also has an integral fast path and bounded 32/64-bit rounding operations.
 * This implementation works with exact rational values and their symmetric rounding margin;
 * the bounded comparisons intentionally retain those observable JDK 17 behaviors. It does not
 * change the IEEE-754 value. Keep the Java-generated boundary fixtures when modifying it.
 */
export function javaPlainDecimal(value: number): string {
  if (!Number.isFinite(value)) throw new RangeError('Expected a finite number');
  if (value === 0) return '0';
  if (Number.isSafeInteger(value)) return String(value);
  const sign = value < 0 ? '-' : '';
  const x = Math.abs(value);
  const buf = new DataView(new ArrayBuffer(8));
  buf.setFloat64(0, x);
  const bits = buf.getBigUint64(0);
  const rawExp = Number((bits >> 52n) & 2047n);
  const significand = (bits & ((1n << 52n) - 1n)) | (rawExp ? 1n << 52n : 0n);
  const shift = rawExp ? rawExp - 1075 : -1074;
  const significantBits = significand.toString(2).length;
  const binExp = shift + significantBits - 1;
  let n = significand,
    d = 1n;
  if (shift >= 0) n <<= BigInt(shift);
  else d <<= BigInt(-shift);
  // Java 17's integral fast path rounds decimal digits smaller than the binary precision.
  if (binExp <= 62 && n % d === 0n) {
    let integer = n / d;
    const ignored = binExp > significantBits ? (1n << BigInt(binExp - significantBits - 1)).toString().length - 1 : 0;
    const unit = 10n ** BigInt(ignored);
    integer = ((integer + unit / 2n) / unit) * unit;
    return sign + String(integer);
  }
  // Java 17 starts from this binary-exponent estimate, including a possible leading zero.
  let e = Math.floor((Number(significand) / 2 ** (significantBits - 1) - 1.5) * 0.289529654 + 0.176091259 + binExp * 0.301029995663981);
  let a = n,
    b = d;
  if (e >= 0) b *= 10n ** BigInt(e);
  else a *= 10n ** BigInt(-e);
  const powerOfTwo = (significand & (significand - 1n)) === 0n;
  const marginShift = shift - 1 - (powerOfTwo ? 1 : 0);
  let mn = 1n,
    md = 1n;
  if (marginShift >= 0) mn <<= BigInt(marginShift);
  else md <<= BigInt(-marginShift);
  if (e >= 0) md *= 10n ** BigInt(e);
  else mn *= 10n ** BigInt(-e);
  function gcd(a: bigint, b: bigint): bigint {
    while (b) {
      [a, b] = [b, a % b];
    }
    return a;
  }
  // Put the scaled value and half-ULP margin over one exact denominator, then reduce.
  let common = (b / gcd(b, md)) * md;
  a *= common / b;
  mn *= common / md;
  b = common;
  common = gcd(gcd(a, b), mn);
  a /= common;
  b /= common;
  mn /= common;
  function twos(n: bigint): number {
    let i = 0;
    while ((n & 1n) === 0n) {
      n >>= 1n;
      i++;
    }
    return i;
  }
  function fiveBits(k: number): number {
    return k === 0 ? 0 : k < 27 ? (5n ** BigInt(k)).toString(2).length : k * 3;
  }
  // Reproduce the JDK choice of bounded arithmetic; overflow affects its last-digit rounding.
  const numeratorBits = significantBits - twos(significand) + twos(a) + fiveBits(Math.max(0, -e));
  const denominatorBits = twos(b) + 1 + fiveBits(Math.max(0, e) + 1);
  const width = numeratorBits < 32 && denominatorBits < 32 ? 32 : numeratorBits < 64 && denominatorBits < 64 ? 64 : 0;
  const bounded = (z: bigint): bigint => (width ? BigInt.asIntN(width, z) : z);
  const tenB = b * 10n;
  let digits = 0n;
  let places = 0;
  let first = true;
  // Emit decimal digits until the remainder lies within a permitted rounding margin.
  for (;;) {
    const digit = a / b;
    a = 10n * (a % b);
    mn = bounded(mn * 10n);
    let low = mn <= 0n || a < mn;
    let high = mn <= 0n || (width ? bounded(a + mn) > tenB : a + mn >= tenB);
    if (first && digit === 0n && !high) e--;
    else {
      digits = digits * 10n + digit;
      places++;
    }
    if (first && (e < -3 || e >= 8)) {
      low = false;
      high = false;
    }
    first = false;
    if (low || high) {
      const distance = bounded(bounded(a * 2n) - tenB);
      if (high && (!low || distance > 0n || (distance === 0n && digits % 2n === 1n))) digits++;
      break;
    }
  }
  let ds = String(digits);
  const power = e - places + 1;
  if (power >= 0) return sign + ds + '0'.repeat(power);
  const point = ds.length + power;
  ds = point > 0 ? ds.slice(0, point) + '.' + ds.slice(point) : '0.' + '0'.repeat(-point) + ds;
  return sign + ds.replace(/\.?0+$/, '');
}
