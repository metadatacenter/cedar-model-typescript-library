import { IdentifierPolicy } from '../../../policy/IdentifierPolicy';
import { TimestampPolicy } from '../../../policy/TimestampPolicy';

/** Draft-04 formats follow the Java validator's legacy URI-reference and offset spellings. */
export const schemaFormats = {
  uri: {
    type: 'string',
    validate(value: string): boolean {
      if (value === '') return true;
      try {
        IdentifierPolicy.assertFieldIri(value, 'uri');
        return true;
      } catch {
        return false;
      }
    },
  },
  'date-time': {
    type: 'string',
    validate(value: string): boolean {
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:?\d{2}(?::\d{2})?)$/.test(value)) return false;
      try {
        TimestampPolicy.canonical(value);
        return true;
      } catch {
        return false;
      }
    },
  },
};
