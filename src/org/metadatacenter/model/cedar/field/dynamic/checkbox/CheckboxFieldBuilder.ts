import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { CheckboxField } from './CheckboxField';

export interface CheckboxFieldBuilder extends TemplateFieldBuilder {
  withDefaultValue(defaultValue: string | null): CheckboxFieldBuilder;

  addCheckboxOption(label: string): CheckboxFieldBuilder;

  addCheckboxOption(label: string, selectedByDefault: boolean): CheckboxFieldBuilder;

  build(): CheckboxField;
}
