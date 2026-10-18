import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';
import { TemporalType } from '../../../types/wrapped-types/TemporalType';
import { TemporalDefaultPolicy } from '../../../../../policy/TemporalDefaultPolicy';

/** Compatibility facade for the shared default policy. */
export class TemporalDefaultValueValidator {
  static assertValid(type: TemporalType, granularity: TemporalGranularity, value: string | null): void {
    TemporalDefaultPolicy.assertValid(type.getValue(), granularity.getValue(), value);
  }
}
