import { EmailField } from './EmailField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';

export interface EmailFieldBuilder extends TemplateFieldBuilder {
  build(): EmailField;
}
