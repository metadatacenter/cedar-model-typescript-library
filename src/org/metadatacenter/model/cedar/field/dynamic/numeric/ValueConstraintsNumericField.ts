import { ValueConstraints } from '../../ValueConstraints';
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
}