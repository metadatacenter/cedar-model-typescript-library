import { ValueConstraints } from '../../ValueConstraints';
import { CedarRadioOption } from './CedarRadioOption';

export class ValueConstraintsRadioField extends ValueConstraints {
  literals: Array<CedarRadioOption> = [];

  public constructor() {
    super();
  }
}
