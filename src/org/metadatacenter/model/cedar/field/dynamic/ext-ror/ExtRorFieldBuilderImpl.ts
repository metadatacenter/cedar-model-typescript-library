import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { ExtRorField } from './ExtRorField';
import { ExtRorFieldImpl } from './ExtRorFieldImpl';
import { ExtRorFieldBuilder } from './ExtRorFieldBuilder';

export class ExtRorFieldBuilderImpl extends TemplateFieldBuilder implements ExtRorFieldBuilder {
  private constructor() {
    super();
  }

  public static create(): ExtRorFieldBuilder {
    return new ExtRorFieldBuilderImpl();
  }

  public build(): ExtRorField {
    const extRorField = ExtRorFieldImpl.buildEmpty();
    super.buildInternal(extRorField);

    return extRorField;
  }
}
