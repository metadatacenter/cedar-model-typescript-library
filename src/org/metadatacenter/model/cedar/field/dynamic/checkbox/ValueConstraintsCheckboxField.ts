import { ValueConstraints } from '../../ValueConstraints';
import { CedarCheckboxOption } from './CedarCheckboxOption';

export class ValueConstraintsCheckboxField extends ValueConstraints {
  literals: Array<CedarCheckboxOption> = [];

  public constructor() {
    super();
  }
}
