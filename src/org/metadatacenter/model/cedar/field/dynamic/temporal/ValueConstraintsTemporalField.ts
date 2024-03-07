import { ValueConstraints } from '../../ValueConstraints';
import { CedarModel } from '../../../CedarModel';
import { JsonNode } from '../../../util/types/JsonNode';
import { TemporalType } from '../../../beans/TemporalType';

export class ValueConstraintsTemporalField extends ValueConstraints {
  temporalType: TemporalType = TemporalType.NULL;

  public constructor() {
    super();
  }

  public toJSON(): JsonNode {
    const obj: JsonNode = {
      [CedarModel.requiredValue]: this.requiredValue,
      [CedarModel.temporalType]: this.temporalType,
    };
    return obj;
  }
}
