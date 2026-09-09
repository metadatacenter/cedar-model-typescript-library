import { ValueConstraintsLiteralField } from '../../ValueConstraintsLiteralField';
import { RadioOption } from './RadioOption';

export class ValueConstraintsRadioField extends ValueConstraintsLiteralField {
  public literals: Array<RadioOption> = [];

  public constructor() {
    super();
  }
}
