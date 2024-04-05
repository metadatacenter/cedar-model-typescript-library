import { TemplateField } from '../../TemplateField';
import { ValueConstraintsCheckboxField } from './ValueConstraintsCheckboxField';

export interface CheckboxField extends TemplateField {
  get valueConstraints(): ValueConstraintsCheckboxField;
}
