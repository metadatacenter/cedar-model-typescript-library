import { NullableNumber } from '../types/basic-types/NullableNumber';

/**
 * The maximum meaning "no upper bound". CEDAR overloads zero for this rather than omitting the key,
 * and the Java library's model reads it the same way.
 */
export const UNBOUNDED_MAX_ITEMS = 0;

/**
 * Refuses bounds no template can satisfy, as the Java library's model does: a negative bound, or a
 * maximum below the minimum. The writers raised such a maximum to the minimum on the way out, which
 * rewrote what the author stated, and turned a maximum of 0, meaning no upper bound, into a limit.
 */
export function assertItemBounds(name: string | null, minItems: NullableNumber, maxItems: NullableNumber): void {
  if (minItems !== null && minItems < 0) {
    throw new Error(`minItems must be zero or greater in ${name}`);
  }
  if (maxItems !== null && maxItems < 0) {
    throw new Error(`maxItems must be zero or greater in ${name}`);
  }
  if (minItems !== null && maxItems !== null && maxItems !== UNBOUNDED_MAX_ITEMS && minItems > maxItems) {
    throw new Error(`minItems must be less than or equal to maxItems in ${name}`);
  }
}
