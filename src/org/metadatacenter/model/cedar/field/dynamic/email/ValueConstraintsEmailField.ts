import { ValueConstraints } from '../../ValueConstraints';
import { CedarModel } from '../../../CedarModel';
import { JsonNode } from '../../../util/types/JsonNode';

export class ValueConstraintsEmailField extends ValueConstraints {
  public constructor() {
    super();
  }

  public toJSON(): JsonNode {
    const obj: JsonNode = {
      [CedarModel.requiredValue]: this.requiredValue,
    };
    return obj;
  }
}
