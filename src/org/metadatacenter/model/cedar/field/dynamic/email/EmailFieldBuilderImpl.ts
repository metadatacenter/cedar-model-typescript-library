import { EmailField } from './EmailField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { EmailFieldImpl } from './EmailFieldImpl';
import { EmailFieldBuilder } from './EmailFieldBuilder';

export class EmailFieldBuilderImpl extends TemplateFieldBuilder implements EmailFieldBuilder {
  private defaultValue: string | null = null;

  private constructor() {
    super();
  }

  public static create(): EmailFieldBuilder {
    return new EmailFieldBuilderImpl();
  }

  public withDefaultValue(defaultValue: string | null): EmailFieldBuilder {
    this.defaultValue = defaultValue;
    return this;
  }

  public build(): EmailField {
    const emailField = EmailFieldImpl.buildEmpty();
    super.buildInternal(emailField);

    emailField.valueConstraints.defaultValue = this.defaultValue;

    return emailField;
  }
}
