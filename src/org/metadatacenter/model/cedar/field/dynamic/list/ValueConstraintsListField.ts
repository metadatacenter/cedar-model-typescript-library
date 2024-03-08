import { ValueConstraints } from '../../ValueConstraints';
import { CedarListOption } from './CedarListOption';

export class ValueConstraintsListField extends ValueConstraints {
  literals: Array<CedarListOption> = [];

  public constructor() {
    super();
  }
}
