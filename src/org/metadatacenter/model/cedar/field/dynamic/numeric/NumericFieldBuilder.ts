import { NumericInput } from '../../../../../policy/NumericPolicy';
import { NumericField } from './NumericField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { NumberType } from '../../../types/wrapped-types/NumberType';

export interface NumericFieldBuilder extends TemplateFieldBuilder {
  withNumberType(numberType: NumberType): NumericFieldBuilder;

  withMinValue(minValue: NumericInput | null): NumericFieldBuilder;

  withMaxValue(maxValue: NumericInput | null): NumericFieldBuilder;

  withDecimalPlaces(decimalPlaces: number | null): NumericFieldBuilder;

  withUnitOfMeasure(unitOfMeasure: string | null): NumericFieldBuilder;

  withDefaultValue(defaultValue: NumericInput | null): NumericFieldBuilder;

  build(): NumericField;
}
