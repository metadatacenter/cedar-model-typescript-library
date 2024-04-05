import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { LinkField } from './LinkField';

export interface LinkFieldBuilder extends TemplateFieldBuilder {
  build(): LinkField;
}
