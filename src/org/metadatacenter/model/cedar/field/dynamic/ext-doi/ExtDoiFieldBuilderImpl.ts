import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { ExtDoiField } from './ExtDoiField';
import { ExtDoiFieldImpl } from './ExtDoiFieldImpl';
import { ExtDoiFieldBuilder } from './ExtDoiFieldBuilder';

export class ExtDoiFieldBuilderImpl extends TemplateFieldBuilder implements ExtDoiFieldBuilder {
  private constructor() {
    super();
  }

  public static create(): ExtDoiFieldBuilder {
    return new ExtDoiFieldBuilderImpl();
  }

  public build(): ExtDoiField {
    const extRorField = ExtDoiFieldImpl.buildEmpty();
    super.buildInternal(extRorField);

    return extRorField;
  }
}
