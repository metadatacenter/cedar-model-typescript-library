import { TextPolicy } from '../../../policy/TextPolicy';

/** Compatibility API; the pinned text contract lives in the lightweight policy package. */
export abstract class JavaStrings {
  public static isBlank(value: string): boolean {
    return TextPolicy.isBlank(value);
  }
  public static isWhitespace(character: string): boolean {
    return TextPolicy.isBlankCodePoint(character.codePointAt(0)!);
  }
}
