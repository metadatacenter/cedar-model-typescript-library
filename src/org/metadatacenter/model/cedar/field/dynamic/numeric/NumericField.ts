import { TemplateField } from '../../TemplateField';
import { ValueConstraintsNumericField } from './ValueConstraintsNumericField';

export interface NumericField extends TemplateField {
  get valueConstraints(): ValueConstraintsNumericField;
}
