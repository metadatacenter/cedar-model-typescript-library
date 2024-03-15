import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { AttributeValueField } from './AttributeValueField';

export class AttributeValueFieldBuilder extends TemplateFieldBuilder {
  public build(): AttributeValueField {
    const avField = AttributeValueField.buildEmptyWithNullValues();
    super.buildInternal(avField);

    return avField;
  }
}
