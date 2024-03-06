import { ValueConstraints } from '../ValueConstraints';
import { CedarModel } from '../../CedarModel';
import { Node } from '../../util/types/Node';
import { TemporalType } from '../../beans/TemporalType';

export class ValueConstraintsTemporalField extends ValueConstraints {
  temporalType: TemporalType = TemporalType.NULL;

  public constructor() {
    super();
  }

  public toJSON(): Node {
    const obj: Node = {
      [CedarModel.requiredValue]: this.requiredValue,
      [CedarModel.temporalType]: this.temporalType,
    };
    return obj;
  }
}
