import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { ExtPfasField } from './ExtPfasField';
import { ExtPfasFieldBuilder } from './ExtPfasFieldBuilder';
import { ExtPfasFieldImpl } from './ExtPfasFieldImpl';

export class ExtPfasFieldBuilderImpl extends TemplateFieldBuilder implements ExtPfasFieldBuilder {
  private constructor() {
    super();
  }

  public static create(): ExtPfasFieldBuilder {
    return new ExtPfasFieldBuilderImpl();
  }

  public build(): ExtPfasField {
    const extPfasField = ExtPfasFieldImpl.buildEmpty();
    super.buildInternal(extPfasField);

    return extPfasField;
  }
}
