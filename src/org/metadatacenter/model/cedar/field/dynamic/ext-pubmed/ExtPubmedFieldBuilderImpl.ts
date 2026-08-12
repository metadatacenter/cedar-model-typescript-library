import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { ExtPubmedField } from './ExtPubmedField';
import { ExtPubmedFieldImpl } from './ExtPubmedFieldImpl';
import { ExtPubmedFieldBuilder } from './ExtPubmedFieldBuilder';

export class ExtPubmedFieldBuilderImpl extends TemplateFieldBuilder implements ExtPubmedFieldBuilder {
  private constructor() {
    super();
  }

  public static create(): ExtPubmedFieldBuilder {
    return new ExtPubmedFieldBuilderImpl();
  }

  public build(): ExtPubmedField {
    const extRorField = ExtPubmedFieldImpl.buildEmpty();
    super.buildInternal(extRorField);

    return extRorField;
  }
}
