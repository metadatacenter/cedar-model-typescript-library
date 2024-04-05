import { TemplateField } from '../../TemplateField';
import { ValueConstraints } from '../../ValueConstraints';

export interface TextArea extends TemplateField {
  get valueConstraints(): ValueConstraints;
}
