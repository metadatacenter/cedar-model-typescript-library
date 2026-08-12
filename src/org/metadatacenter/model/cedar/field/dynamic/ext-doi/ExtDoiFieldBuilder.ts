import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { ExtDoiField } from './ExtDoiField';

export interface ExtDoiFieldBuilder extends TemplateFieldBuilder {
  build(): ExtDoiField;
}
