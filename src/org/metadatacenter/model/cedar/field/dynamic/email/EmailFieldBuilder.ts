import { EmailField } from './EmailField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';

export interface EmailFieldBuilder extends TemplateFieldBuilder {
  withDefaultValue(defaultValue: string | null): EmailFieldBuilder;

  build(): EmailField;
}
