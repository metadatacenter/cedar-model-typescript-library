import { ValueConstraints } from '../../ValueConstraints';
import { CedarCheckboxOption } from './CedarCheckboxOption';

export class ValueConstraintsCheckboxField extends ValueConstraints {
  multipleChoice: boolean = true;
  literals: Array<CedarCheckboxOption> = [];

  public constructor() {
    super();
  }
}
