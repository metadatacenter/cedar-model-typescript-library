import { EmailField } from './EmailField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';

export class EmailFieldBuilder extends TemplateFieldBuilder {
  public build(): EmailField {
    const emailField = EmailField.buildEmptyWithNullValues();
    super.buildInternal(emailField);

    return emailField;
  }
}
