import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { ExtRridField } from './ExtRridField';

export interface ExtRridFieldBuilder extends TemplateFieldBuilder {
  build(): ExtRridField;
}
