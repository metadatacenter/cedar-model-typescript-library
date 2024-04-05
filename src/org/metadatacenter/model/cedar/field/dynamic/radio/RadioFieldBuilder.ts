import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { RadioField } from './RadioField';

export interface RadioFieldBuilder extends TemplateFieldBuilder {
  addRadioOption(label: string): RadioFieldBuilder;

  addRadioOption(label: string, selectedByDefault: boolean): RadioFieldBuilder;

  build(): RadioField;
}
