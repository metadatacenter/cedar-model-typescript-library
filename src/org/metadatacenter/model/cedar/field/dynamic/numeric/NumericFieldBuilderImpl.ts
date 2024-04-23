import { NumericField } from './NumericField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { NumberType } from '../../../types/wrapped-types/NumberType';
import { NumericFieldBuilder } from './NumericFieldBuilder';
import { NumericFieldImpl } from './NumericFieldImpl';

export class NumericFieldBuilderImpl extends TemplateFieldBuilder implements NumericFieldBuilder {
  private numberType: NumberType = NumberType.NULL;
  private minValue: number | null = null;
  private maxValue: number | null = null;
  private decimalPlaces: number | null = null;
  private unitOfMeasure: string | null = null;

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

  public withMinValue(minValue: number | null): NumericFieldBuilder {
    this.minValue = minValue;
    return this;
  }

  public withMaxValue(maxValue: number | null): NumericFieldBuilder {
    this.maxValue = maxValue;
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

  public build(): NumericField {
    const numericField = NumericFieldImpl.buildEmpty();
    super.buildInternal(numericField);

    numericField.valueConstraints.numberType = this.numberType;
    numericField.valueConstraints.minValue = this.minValue;
    numericField.valueConstraints.maxValue = this.maxValue;
    numericField.valueConstraints.decimalPlaces = this.decimalPlaces;
    numericField.valueConstraints.unitOfMeasure = this.unitOfMeasure;

    return numericField;
  }
}
