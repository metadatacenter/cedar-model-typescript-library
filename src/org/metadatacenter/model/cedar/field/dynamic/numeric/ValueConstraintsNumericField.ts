import { ValueConstraints } from '../../ValueConstraints';
import { NumberType } from '../../../types/wrapped-types/NumberType';

export class ValueConstraintsNumericField extends ValueConstraints {
  numberType: NumberType = NumberType.DECIMAL;
  minValue: number | null = null;
  maxValue: number | null = null;
  decimalPlaces: number | null = null;
  unitOfMeasure: string | null = null;

  public constructor() {
    super();
  }
}
