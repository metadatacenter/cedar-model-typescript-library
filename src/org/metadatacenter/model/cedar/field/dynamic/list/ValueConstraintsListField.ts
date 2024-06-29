import { ValueConstraints } from '../../ValueConstraints';
import { ListOption } from './ListOption';

export class ValueConstraintsListField extends ValueConstraints {
  public defaultValue: string | null = null;
  public literals: Array<ListOption> = [];

  public constructor() {
    super();
  }
}
