import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { AttributeValueField } from './AttributeValueField';

export interface AttributeValueFieldBuilder extends TemplateFieldBuilder {
  build(): AttributeValueField;
}
