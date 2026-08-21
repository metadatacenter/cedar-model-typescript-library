import { ValueConstraints } from '../../ValueConstraints';
import { TemporalType } from '../../../types/wrapped-types/TemporalType';

export class ValueConstraintsTemporalField extends ValueConstraints {
  temporalType: TemporalType = TemporalType.DATETIME;
  defaultValue: string | null = null;

  public constructor() {
    super();
  }
}
