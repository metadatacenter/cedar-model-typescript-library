import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { ExtNihGrantIdField } from './ExtNihGrantIdField';

export interface ExtNihGrantIdFieldBuilder extends TemplateFieldBuilder {
  build(): ExtNihGrantIdField;
}
