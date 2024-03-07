import { ValueConstraints } from '../../ValueConstraints';
import { CedarModel } from '../../../CedarModel';
import { JsonNode } from '../../../util/types/JsonNode';
import { NumberType } from '../../../beans/NumberType';

export class ValueConstraintsNumericField extends ValueConstraints {
  numberType: NumberType = NumberType.NULL;
  minValue: number | null = null;
  maxValue: number | null = null;
  decimalPlace: number | null = null;
  unitOfMeasure: string | null = null;

  public constructor() {
    super();
  }

  public toJSON(): JsonNode {
    const obj: JsonNode = {
      [CedarModel.requiredValue]: this.requiredValue,
      [CedarModel.numberType]: this.numberType,
    };
    if (this.minValue != null) {
      obj[CedarModel.minValue] = this.minValue;
    }
    if (this.maxValue != null) {
      obj[CedarModel.maxValue] = this.maxValue;
    }
    if (this.decimalPlace != null) {
      obj[CedarModel.decimalPlace] = this.decimalPlace;
    }
    if (this.unitOfMeasure != null) {
      obj[CedarModel.unitOfMeasure] = this.unitOfMeasure;
    }
    return obj;
  }
}
