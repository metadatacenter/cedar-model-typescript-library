import { ValueConstraints } from '../../ValueConstraints';
import { TemporalType } from '../../../types/beans/TemporalType';

export class ValueConstraintsTemporalField extends ValueConstraints {
  temporalType: TemporalType = TemporalType.NULL;

  public constructor() {
    super();
  }
}
