import { TemplateField } from '../../TemplateField';
import { ValueConstraintsRadioField } from './ValueConstraintsRadioField';

export interface RadioField extends TemplateField {
  get valueConstraints(): ValueConstraintsRadioField;
}
