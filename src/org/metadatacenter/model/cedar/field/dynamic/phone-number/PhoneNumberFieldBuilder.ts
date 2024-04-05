import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { PhoneNumberField } from './PhoneNumberField';

export interface PhoneNumberFieldBuilder extends TemplateFieldBuilder {
  build(): PhoneNumberField;
}
