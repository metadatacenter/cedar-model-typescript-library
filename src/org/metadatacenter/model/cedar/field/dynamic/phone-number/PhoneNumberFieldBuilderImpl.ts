import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { PhoneNumberField } from './PhoneNumberField';
import { PhoneNumberFieldBuilder } from './PhoneNumberFieldBuilder';
import { PhoneNumberFieldImpl } from './PhoneNumberFieldImpl';

export class PhoneNumberFieldBuilderImpl extends TemplateFieldBuilder implements PhoneNumberFieldBuilder {
  private defaultValue: string | null = null;

  private constructor() {
    super();
  }

  public static create(): PhoneNumberFieldBuilder {
    return new PhoneNumberFieldBuilderImpl();
  }

  public withDefaultValue(defaultValue: string | null): PhoneNumberFieldBuilder {
    this.defaultValue = defaultValue;
    return this;
  }

  public build(): PhoneNumberField {
    const phoneNumberField = PhoneNumberFieldImpl.buildEmpty();
    super.buildInternal(phoneNumberField);

    phoneNumberField.valueConstraints.defaultValue = this.defaultValue;

    return phoneNumberField;
  }
}
