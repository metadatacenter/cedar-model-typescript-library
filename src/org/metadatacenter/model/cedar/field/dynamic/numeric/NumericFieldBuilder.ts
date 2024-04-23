import { NumericField } from './NumericField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { NumberType } from '../../../types/wrapped-types/NumberType';

export interface NumericFieldBuilder extends TemplateFieldBuilder {
  withNumberType(numberType: NumberType): NumericFieldBuilder;

  withMinValue(minValue: number | null): NumericFieldBuilder;

  withMaxValue(maxValue: number | null): NumericFieldBuilder;

  withDecimalPlaces(decimalPlaces: number | null): NumericFieldBuilder;

  withUnitOfMeasure(unitOfMeasure: string | null): NumericFieldBuilder;

  build(): NumericField;
}
