import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { PhoneNumberField } from './PhoneNumberField';
import { PhoneNumberFieldBuilder } from './PhoneNumberFieldBuilder';
import { PhoneNumberFieldImpl } from './PhoneNumberFieldImpl';

export class PhoneNumberFieldBuilderImpl extends TemplateFieldBuilder implements PhoneNumberFieldBuilder {
  private constructor() {
    super();
  }

  public static create(): PhoneNumberFieldBuilder {
    return new PhoneNumberFieldBuilderImpl();
  }

  public build(): PhoneNumberField {
    const phoneNumberField = PhoneNumberFieldImpl.buildEmpty();
    super.buildInternal(phoneNumberField);

    return phoneNumberField;
  }
}
