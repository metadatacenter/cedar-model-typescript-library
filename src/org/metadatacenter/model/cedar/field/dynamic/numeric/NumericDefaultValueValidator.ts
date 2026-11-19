import { NumberType, NumberTypeValues } from '../../../types/wrapped-types/NumberType';
import { NumericPolicy, NumericValue } from '../../../../../policy/NumericPolicy';
import { FieldValuePolicy } from '../../../../../policy/FieldValuePolicy';
import { ValueConstraintsNumericField } from './ValueConstraintsNumericField';

export class NumericDefaultValueValidator {
  /**
   * Refuse an integer datatype that states decimal places, as Java's reader does, by the rule the validator applies.
   * The strict readers call this; the compatibility reader opens such a field and leaves the verdict to the
   * validator. `at` locates the decimal places in the document being read.
   */
  public static assertDecimalPlacesFitDatatype(valueConstraints: ValueConstraintsNumericField, at: string): void {
    if (FieldValuePolicy.integerWithDecimalPlaces(valueConstraints.numberType.getValue(), valueConstraints.decimalPlaces))
      throw new Error(`An integer datatype cannot have decimal places, at ${at}.`);
  }

  public static assertValid(
    numberType: NumberType,
    defaultValue: NumericValue | null,
    minValue: NumericValue | null = null,
    maxValue: NumericValue | null = null,
  ): void {
    if (minValue !== null) NumericPolicy.value(minValue);
    if (maxValue !== null) NumericPolicy.value(maxValue);
    if (minValue !== null && maxValue !== null && NumericPolicy.compare(minValue, maxValue) > 0)
      throw new Error('Minimum value exceeds maximum value.');
    if (defaultValue === null) return;
    NumericPolicy.value(defaultValue);
    const type = numberType.getValue();
    if (type === null) throw new Error('Numeric default requires a numeric datatype.');
    const integerRanges: Partial<Record<string, [string, string]>> = {
      [NumberTypeValues.BYTE]: ['-128', '127'],
      [NumberTypeValues.SHORT]: ['-32768', '32767'],
      [NumberTypeValues.INT]: ['-2147483648', '2147483647'],
      [NumberTypeValues.LONG]: ['-9223372036854775808', '9223372036854775807'],
    };
    const range = integerRanges[type];
    if (range) {
      if (typeof defaultValue === 'number' && !Number.isSafeInteger(defaultValue))
        throw new Error('Numeric default requires exact decimal text for integers beyond the safe JavaScript range.');
      if (!NumericPolicy.isInteger(defaultValue)) throw new Error(`Numeric default ${defaultValue} must be an integer for ${type}.`);
      if (NumericPolicy.compare(defaultValue, range[0]) < 0 || NumericPolicy.compare(defaultValue, range[1]) > 0)
        throw new Error(`Numeric default ${defaultValue} is outside the ${type} range.`);
    }
    if (type === NumberTypeValues.FLOAT || type === NumberTypeValues.DOUBLE) {
      const magnitude = String(defaultValue).replace(/^-/, '');
      const max = type === NumberTypeValues.FLOAT ? '3.4028234663852886e38' : '1.7976931348623157e308';
      const min = type === NumberTypeValues.FLOAT ? '1.401298464324817e-45' : '4.9e-324';
      if (
        NumericPolicy.compare(magnitude, max) > 0 ||
        (NumericPolicy.compare(magnitude, 0) !== 0 && NumericPolicy.compare(magnitude, min) < 0)
      )
        throw new Error(`Numeric default ${defaultValue} is outside the ${type} range.`);
    }
    if (minValue !== null && NumericPolicy.compare(defaultValue, minValue) < 0)
      throw new Error(`Numeric default ${defaultValue} is below minValue ${minValue}.`);
    if (maxValue !== null && NumericPolicy.compare(defaultValue, maxValue) > 0)
      throw new Error(`Numeric default ${defaultValue} is above maxValue ${maxValue}.`);
  }
}
