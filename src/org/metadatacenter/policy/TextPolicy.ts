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

  /** Explicit authoring affordance only, never a reader/writer or identity normalization. */
  public static trimInputPadding(value: string): string {
    return value.replace(/^[\t\n\r ]+|[\t\n\r ]+$/g, '');
  }
}
