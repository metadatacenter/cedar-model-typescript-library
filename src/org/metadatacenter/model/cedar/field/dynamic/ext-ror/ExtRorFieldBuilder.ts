import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { ExtRorField } from './ExtRorField';

export interface ExtRorFieldBuilder extends TemplateFieldBuilder {
  build(): ExtRorField;
}
