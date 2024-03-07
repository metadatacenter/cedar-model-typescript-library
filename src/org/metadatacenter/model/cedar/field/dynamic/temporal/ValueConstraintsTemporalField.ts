import { ValueConstraints } from '../../ValueConstraints';
import { TemporalType } from '../../../beans/TemporalType';

export class ValueConstraintsTemporalField extends ValueConstraints {
  temporalType: TemporalType = TemporalType.NULL;

  public constructor() {
    super();
  }
}
