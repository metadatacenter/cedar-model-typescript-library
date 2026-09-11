import { ValueConstraintsLiteralField } from '../../ValueConstraintsLiteralField';
import { ListOption } from './ListOption';

export class ValueConstraintsListField extends ValueConstraintsLiteralField {
  public literals: Array<ListOption> = [];

  public constructor() {
    super();
  }
}
