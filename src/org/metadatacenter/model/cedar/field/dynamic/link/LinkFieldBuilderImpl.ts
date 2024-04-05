import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { LinkField } from './LinkField';
import { LinkFieldBuilder } from './LinkFieldBuilder';
import { LinkFieldImpl } from './LinkFieldImpl';

export class LinkFieldBuilderImpl extends TemplateFieldBuilder implements LinkFieldBuilder {
  private constructor() {
    super();
  }

  public static create(): LinkFieldBuilder {
    return new LinkFieldBuilderImpl();
  }

  public build(): LinkField {
    const linkField = LinkFieldImpl.buildEmpty();
    super.buildInternal(linkField);

    return linkField;
  }
}
