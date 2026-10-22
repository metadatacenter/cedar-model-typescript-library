/** Stable CEDAR text rules. Validation never trims or normalizes stored spelling. */
export class TextPolicy {
  private constructor() {}

  /** Pinned Java 17 blankness; deliberately differs from JavaScript trim and Unicode White_Space. */
  public static isBlank(value: string): boolean {
    for (const character of value) if (!this.isBlankCodePoint(character.codePointAt(0)!)) return false;
    return true;
  }

  public static isBlankCodePoint(cp: number): boolean {
    return (
      (cp >= 0x09 && cp <= 0x0d) ||
      (cp >= 0x1c && cp <= 0x20) ||
      cp === 0x1680 ||
      (cp >= 0x2000 && cp <= 0x2006) ||
      (cp >= 0x2008 && cp <= 0x200a) ||
      cp === 0x2028 ||
      cp === 0x2029 ||
      cp === 0x205f ||
      cp === 0x3000
    );
  }

  /** JSON Schema length, distinct from UTF-16 layout offsets and displayed graphemes. */
  public static codePointLength(value: string): number {
    return Array.from(value).length;
  }

  /**
   * Whether two strings are equal ignoring case, as Java's `String.equalsIgnoreCase` decides it: the
   * same length, and at each position the same character, the same upper case, or the same lower case
   * of the upper cases. JavaScript applies the full case mappings and Java the single-character ones,
   * so the two can differ where a mapping yields more than one character, as the lower case of U+0130
   * does.
   */
  public static equalsIgnoreCase(a: string, b: string): boolean {
    const left = Array.from(a);
    const right = Array.from(b);
    if (a.length !== b.length || left.length !== right.length) return false;
    return left.every((character: string, index: number) => {
      const other = right[index];
      const upper = character.toUpperCase();
      const otherUpper = other.toUpperCase();
      return character === other || upper === otherUpper || upper.toLowerCase() === otherUpper.toLowerCase();
    });
  }

  /** Explicit authoring affordance only, never a reader/writer or identity normalization. */
  public static trimInputPadding(value: string): string {
    return value.replace(/^[\t\n\r ]+|[\t\n\r ]+$/g, '');
  }
}
