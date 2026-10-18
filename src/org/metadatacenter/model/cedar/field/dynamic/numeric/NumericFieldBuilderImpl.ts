import { FieldValuePolicy } from '../../../../../policy/FieldValuePolicy';
import { NumericInput, NumericValue, NumericPolicy } from '../../../../../policy/NumericPolicy';
import { NumericField } from './NumericField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { NumberType } from '../../../types/wrapped-types/NumberType';
import { NumericFieldBuilder } from './NumericFieldBuilder';
import { NumericFieldImpl } from './NumericFieldImpl';
import { NumericDefaultValueValidator } from './NumericDefaultValueValidator';

export class NumericFieldBuilderImpl extends TemplateFieldBuilder implements NumericFieldBuilder {
  private numberType: NumberType = NumberType.DECIMAL;
  private minValue: NumericValue | null = null;
  private maxValue: NumericValue | null = null;
  private decimalPlaces: number | null = null;
  private unitOfMeasure: string | null = null;
  private defaultValue: NumericValue | null = null;

  private constructor() {
    super();
  }

  public static create(): NumericFieldBuilder {
    return new NumericFieldBuilderImpl();
  }

  public withNumberType(numberType: NumberType): NumericFieldBuilder {
    this.numberType = numberType;
    return this;
  }

  public withMinValue(minValue: NumericInput | null): NumericFieldBuilder {
    this.minValue = minValue === null ? null : NumericPolicy.value(minValue);
    return this;
  }

  public withMaxValue(maxValue: NumericInput | null): NumericFieldBuilder {
    this.maxValue = maxValue === null ? null : NumericPolicy.value(maxValue);
    return this;
  }

  public withDecimalPlaces(decimalPlaces: number | null): NumericFieldBuilder {
    this.decimalPlaces = decimalPlaces;
    return this;
  }

  public withUnitOfMeasure(unitOfMeasure: string | null): NumericFieldBuilder {
    this.unitOfMeasure = unitOfMeasure;
    return this;
  }

  public withDefaultValue(defaultValue: NumericInput | null): NumericFieldBuilder {
    this.defaultValue = defaultValue === null ? null : NumericPolicy.value(defaultValue);
    return this;
  }

  public build(): NumericField {
    NumericDefaultValueValidator.assertValid(this.numberType, this.defaultValue, this.minValue, this.maxValue);
    FieldValuePolicy.assertConsistent({
      _ui: { inputType: 'numeric' },
      _valueConstraints: {
        numberType: this.numberType.getValue(),
        defaultValue: this.defaultValue,
        minValue: this.minValue,
        maxValue: this.maxValue,
        decimalPlace: this.decimalPlaces,
      },
    });
    const numericField = NumericFieldImpl.buildEmpty();
    super.buildInternal(numericField);

    numericField.valueConstraints.numberType = this.numberType;
    numericField.valueConstraints.minValue = this.minValue;
    numericField.valueConstraints.maxValue = this.maxValue;
    numericField.valueConstraints.decimalPlaces = this.decimalPlaces;
    numericField.valueConstraints.unitOfMeasure = this.unitOfMeasure;
    numericField.valueConstraints.defaultValue = this.defaultValue;

    return numericField;
  }
}
