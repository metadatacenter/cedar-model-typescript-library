import { NumericField } from './NumericField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { NumberType } from '../../../types/wrapped-types/NumberType';

export class NumericFieldBuilder extends TemplateFieldBuilder {
  private numberType: NumberType = NumberType.NULL;
  private minValue: number | null = null;
  private maxValue: number | null = null;
  private decimalPlace: number | null = null;
  private unitOfMeasure: string | null = null;

  public withNumberType(numberType: NumberType): NumericFieldBuilder {
    this.numberType = numberType;
    return this;
  }

  public withMinValue(minValue: number | null): NumericFieldBuilder {
    this.minValue = minValue;
    return this;
  }

  public withMaxValue(maxValue: number | null): NumericFieldBuilder {
    this.maxValue = maxValue;
    return this;
  }

  public withDecimalPlace(decimalPlace: number | null): NumericFieldBuilder {
    this.decimalPlace = decimalPlace;
    return this;
  }

  public withUnitOfMeasure(unitOfMeasure: string | null): NumericFieldBuilder {
    this.unitOfMeasure = unitOfMeasure;
    return this;
  }

  public build(): NumericField {
    const numericField = NumericField.buildEmptyWithNullValues();
    super.buildInternal(numericField); // Assumes implementation similar to TextFieldBuilder

    numericField.valueConstraints.numberType = this.numberType;
    numericField.valueConstraints.minValue = this.minValue;
    numericField.valueConstraints.maxValue = this.maxValue;
    numericField.valueConstraints.decimalPlace = this.decimalPlace;
    numericField.valueConstraints.unitOfMeasure = this.unitOfMeasure;

    return numericField;
  }
}
