import { ValueConstraints } from '../../ValueConstraints';
import { CedarModel } from '../../../CedarModel';
import { Node } from '../../../util/types/Node';

export class ValueConstraintsEmailField extends ValueConstraints {
  public constructor() {
    super();
  }

  public toJSON(): Node {
    const obj: Node = {
      [CedarModel.requiredValue]: this.requiredValue,
    };
    return obj;
  }
}
