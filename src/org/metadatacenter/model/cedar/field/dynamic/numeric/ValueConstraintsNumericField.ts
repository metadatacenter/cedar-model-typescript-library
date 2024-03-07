import { ValueConstraints } from '../../ValueConstraints';
import { CedarModel } from '../../../CedarModel';
import { JsonNode } from '../../../util/types/JsonNode';
import { NumberType } from '../../../beans/NumberType';

export class ValueConstraintsNumericField extends ValueConstraints {
  numberType: NumberType = NumberType.NULL;

  public constructor() {
    super();
  }

  public toJSON(): JsonNode {
    const obj: JsonNode = {
      [CedarModel.requiredValue]: this.requiredValue,
      [CedarModel.numberType]: this.numberType,
    };
    return obj;
  }
}
