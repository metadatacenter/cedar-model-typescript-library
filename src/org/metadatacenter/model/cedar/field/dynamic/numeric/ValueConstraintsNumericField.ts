import { NumericValue } from '../../../../../policy/NumericPolicy';
import { ValueConstraints } from '../../ValueConstraints';
import { NumberType } from '../../../types/wrapped-types/NumberType';

export class ValueConstraintsNumericField extends ValueConstraints {
  numberType: NumberType = NumberType.DECIMAL;
  minValue: NumericValue | null = null;
  maxValue: NumericValue | null = null;
  decimalPlaces: number | null = null;
  unitOfMeasure: string | null = null;
  defaultValue: NumericValue | null = null;

  public constructor() {
    super();
  }
}
