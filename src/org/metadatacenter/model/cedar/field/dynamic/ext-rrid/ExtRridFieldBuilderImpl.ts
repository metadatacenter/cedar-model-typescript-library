import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { ExtRridField } from './ExtRridField';
import { ExtRridFieldImpl } from './ExtRridFieldImpl';
import { ExtRridFieldBuilder } from './ExtRridFieldBuilder';

export class ExtRridFieldBuilderImpl extends TemplateFieldBuilder implements ExtRridFieldBuilder {
  private constructor() {
    super();
  }

  public static create(): ExtRridFieldBuilder {
    return new ExtRridFieldBuilderImpl();
  }

  public build(): ExtRridField {
    const extRorField = ExtRridFieldImpl.buildEmpty();
    super.buildInternal(extRorField);

    return extRorField;
  }
}
