import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { PhoneNumberField } from './PhoneNumberField';

export class PhoneNumberFieldBuilder extends TemplateFieldBuilder {
  public build(): PhoneNumberField {
    const phoneNumberField = PhoneNumberField.buildEmptyWithNullValues();
    super.buildInternal(phoneNumberField);

    return phoneNumberField;
  }
}
