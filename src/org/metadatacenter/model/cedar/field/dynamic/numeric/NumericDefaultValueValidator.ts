import { NumberType, NumberTypeValues } from '../../../types/wrapped-types/NumberType';

export class NumericDefaultValueValidator {
  public static assertValid(
    numberType: NumberType,
    defaultValue: number | null,
    minValue: number | null = null,
    maxValue: number | null = null,
  ): void {
    if (defaultValue === null) {
      return;
    }
    if (!Number.isFinite(defaultValue)) {
      throw new Error('Numeric default must be finite.');
    }

    const type = numberType.getValue();
    if (type === null) {
      throw new Error('Numeric default requires a numeric datatype.');
    }

    const integerRanges: Partial<Record<string, [number, number]>> = {
      [NumberTypeValues.BYTE]: [-128, 127],
      [NumberTypeValues.SHORT]: [-32768, 32767],
      [NumberTypeValues.INT]: [-2147483648, 2147483647],
      [NumberTypeValues.LONG]: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    };
    const integerRange = integerRanges[type];
    if (integerRange !== undefined) {
      if (!Number.isSafeInteger(defaultValue)) {
        throw new Error(`Numeric default ${defaultValue} must be a safely representable integer for ${type}.`);
      }
      if (defaultValue < integerRange[0] || defaultValue > integerRange[1]) {
        throw new Error(`Numeric default ${defaultValue} is outside the ${type} range.`);
      }
    }

    if (type === NumberTypeValues.FLOAT) {
      const magnitude = Math.abs(defaultValue);
      if (magnitude > 3.4028234663852886e38 || (magnitude !== 0 && magnitude < 1.401298464324817e-45)) {
        throw new Error(`Numeric default ${defaultValue} is outside the ${type} range.`);
      }
    }
    if (minValue !== null && defaultValue < minValue) {
      throw new Error(`Numeric default ${defaultValue} is below minValue ${minValue}.`);
    }
    if (maxValue !== null && defaultValue > maxValue) {
      throw new Error(`Numeric default ${defaultValue} is above maxValue ${maxValue}.`);
    }
  }
}
