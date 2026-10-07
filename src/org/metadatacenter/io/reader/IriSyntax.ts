import { ReaderUtil } from './ReaderUtil';

/**
 * The rule this library's readers hold an IRI to, for a caller that has to decide before reading.
 *
 * An editor checks what an author types, and holds back from the reader a value the reader would
 * refuse, so the author can repair it. A check of its own drifts from the readers': one that accepts
 * a value they refuse lets the author save what nothing can then open. This is the readers' own
 * check, the one they apply to every identifier outside a field's value, which must be absolute.
 */
export class IriSyntax {
  private constructor() {}

  /** Whether the readers take `value` as an IRI. An empty string is absence, not an IRI. */
  public static isValid(value: string): boolean {
    if (value === '') return false;
    try {
      ReaderUtil.assertIdentifier(value, 'value');
      return true;
    } catch {
      return false;
    }
  }
}
