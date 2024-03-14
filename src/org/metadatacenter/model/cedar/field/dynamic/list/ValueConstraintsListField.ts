import { ValueConstraints } from '../../ValueConstraints';
import { ListOption } from './ListOption';

export class ValueConstraintsListField extends ValueConstraints {
  literals: Array<ListOption> = [];

  public constructor() {
    super();
  }
}
