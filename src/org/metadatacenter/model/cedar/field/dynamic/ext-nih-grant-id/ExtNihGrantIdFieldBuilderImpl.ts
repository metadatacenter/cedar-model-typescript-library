import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { ExtNihGrantIdField } from './ExtNihGrantIdField';
import { ExtNihGrantIdFieldImpl } from './ExtNihGrantIdFieldImpl';
import { ExtNihGrantIdFieldBuilder } from './ExtNihGrantIdFieldBuilder';

export class ExtNihGrantIdFieldBuilderImpl extends TemplateFieldBuilder implements ExtNihGrantIdFieldBuilder {
  private constructor() {
    super();
  }

  public static create(): ExtNihGrantIdFieldBuilder {
    return new ExtNihGrantIdFieldBuilderImpl();
  }

  public build(): ExtNihGrantIdField {
    const extRorField = ExtNihGrantIdFieldImpl.buildEmpty();
    super.buildInternal(extRorField);

    return extRorField;
  }
}
