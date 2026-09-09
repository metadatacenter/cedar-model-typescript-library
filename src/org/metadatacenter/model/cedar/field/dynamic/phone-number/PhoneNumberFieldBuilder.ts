import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { PhoneNumberField } from './PhoneNumberField';

export interface PhoneNumberFieldBuilder extends TemplateFieldBuilder {
  withDefaultValue(defaultValue: string | null): PhoneNumberFieldBuilder;

  build(): PhoneNumberField;
}
