import { TemplateField } from '../../TemplateField';
import { ValueConstraintsListField } from './ValueConstraintsListField';

export interface ListField extends TemplateField {
  get valueConstraints(): ValueConstraintsListField;

  get multipleChoice(): boolean;
}
