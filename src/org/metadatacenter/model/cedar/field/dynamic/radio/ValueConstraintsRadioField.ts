import { ValueConstraints } from '../../ValueConstraints';
import { RadioOption } from './RadioOption';

export class ValueConstraintsRadioField extends ValueConstraints {
  literals: Array<RadioOption> = [];

  public constructor() {
    super();
  }
}
