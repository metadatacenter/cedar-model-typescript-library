import { ValueConstraintsLiteralField } from '../../ValueConstraintsLiteralField';
import { CheckboxOption } from './CheckboxOption';

export class ValueConstraintsCheckboxField extends ValueConstraintsLiteralField {
  public literals: Array<CheckboxOption> = [];

  public constructor() {
    super();
  }
}
