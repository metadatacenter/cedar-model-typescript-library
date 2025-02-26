import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { ExtOrcidField } from './ExtOrcidField';

export interface ExtOrcidFieldBuilder extends TemplateFieldBuilder {
  build(): ExtOrcidField;
}
