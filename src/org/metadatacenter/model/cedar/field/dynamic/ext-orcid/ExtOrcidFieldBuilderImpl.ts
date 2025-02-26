import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { ExtOrcidField } from './ExtOrcidField';
import { ExtOrcidFieldImpl } from './ExtOrcidFieldImpl';
import { ExtOrcidFieldBuilder } from './ExtOrcidFieldBuilder';

export class ExtOrcidFieldBuilderImpl extends TemplateFieldBuilder implements ExtOrcidFieldBuilder {
  private constructor() {
    super();
  }

  public static create(): ExtOrcidFieldBuilder {
    return new ExtOrcidFieldBuilderImpl();
  }

  public build(): ExtOrcidField {
    const extOrcidField = ExtOrcidFieldImpl.buildEmpty();
    super.buildInternal(extOrcidField);

    return extOrcidField;
  }
}
