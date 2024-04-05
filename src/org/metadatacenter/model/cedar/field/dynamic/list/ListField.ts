import { TemplateField } from '../../TemplateField';
import { ValueConstraintsListField } from './ValueConstraintsListField';

export interface ListField extends TemplateField {
  get valueConstraints(): ValueConstraintsListField;

  set multipleChoice(multipleChoice: boolean);

  get multipleChoice(): boolean;
}
