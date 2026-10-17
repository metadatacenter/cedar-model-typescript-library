/**
 * Java's string predicates, ported so that both model libraries apply one definition. Where both refuse
 * a blank value, a difference in what counts as blank would let one of them write a document the other
 * refuses.
 */
export abstract class JavaStrings {
  /** Java's `String.isBlank`: true for an empty string and for one made only of whitespace. */
  public static isBlank(value: string): boolean {
    return Array.from(value).every(JavaStrings.isWhitespace);
  }

  /**
   * Java's `Character.isWhitespace`: the controls from tab to carriage return, the four information
   * separators, and every space, line and paragraph separator other than the three no-break spaces.
   */
  public static isWhitespace(character: string): boolean {
    const cp = character.codePointAt(0)!;
    if ((cp >= 0x09 && cp <= 0x0d) || (cp >= 0x1c && cp <= 0x1f)) return true;
    return /\p{Z}/u.test(character) && cp !== 0xa0 && cp !== 0x2007 && cp !== 0x202f;
  }
}
