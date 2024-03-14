import { ValueConstraints } from '../../ValueConstraints';
import { CheckboxOption } from './CheckboxOption';

export class ValueConstraintsCheckboxField extends ValueConstraints {
  literals: Array<CheckboxOption> = [];

  public constructor() {
    super();
  }
}
