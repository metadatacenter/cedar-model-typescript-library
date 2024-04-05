import { EmailField } from './EmailField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { EmailFieldImpl } from './EmailFieldImpl';
import { EmailFieldBuilder } from './EmailFieldBuilder';

export class EmailFieldBuilderImpl extends TemplateFieldBuilder implements EmailFieldBuilder {
  private constructor() {
    super();
  }

  public static create(): EmailFieldBuilder {
    return new EmailFieldBuilderImpl();
  }

  public build(): EmailField {
    const emailField = EmailFieldImpl.buildEmpty();
    super.buildInternal(emailField);

    return emailField;
  }
}
