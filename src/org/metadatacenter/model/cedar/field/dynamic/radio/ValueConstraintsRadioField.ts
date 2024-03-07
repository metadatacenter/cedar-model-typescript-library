import { ValueConstraints } from '../../ValueConstraints';
import { CedarRadioOption } from './CedarRadioOption';

export class ValueConstraintsRadioField extends ValueConstraints {
  multipleChoice: boolean = false;
  literals: Array<CedarRadioOption> = [];

  public constructor() {
    super();
  }
}
