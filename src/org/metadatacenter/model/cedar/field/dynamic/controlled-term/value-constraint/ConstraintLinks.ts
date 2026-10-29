import { constraintLinks } from '../../../../validation/generated/constraint-links';

/** Optional public URLs shared by all controlled-term constraints and terminology results. */
export interface ConstraintLinks {
  readonly landingPage?: string;
  readonly icon?: string;
}

/** Runtime validation uses the same compiled schema as saved artifacts, not TypeScript types alone. */
export function readConstraintLinks(value: unknown): ConstraintLinks | null {
  if (value === undefined) return null;
  if (!constraintLinks(value)) throw new Error('links must contain only optional landingPage and icon HTTP(S) URLs');
  const links = value as ConstraintLinks;
  return Object.freeze({
    ...(links.landingPage !== undefined ? { landingPage: links.landingPage } : {}),
    ...(links.icon !== undefined ? { icon: links.icon } : {}),
  });
}
