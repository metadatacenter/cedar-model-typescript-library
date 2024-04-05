import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { AttributeValueField } from './AttributeValueField';
import { AttributeValueFieldImpl } from './AttributeValueFieldImpl';
import { AttributeValueFieldBuilder } from './AttributeValueFieldBuilder';

export class AttributeValueFieldBuilderImpl extends TemplateFieldBuilder implements AttributeValueFieldBuilder {
  private constructor() {
    super();
  }

  public static create(): AttributeValueFieldBuilder {
    return new AttributeValueFieldBuilderImpl();
  }

  public build(): AttributeValueField {
    const avField = AttributeValueFieldImpl.buildEmpty();
    super.buildInternal(avField);

    return avField;
  }
}
