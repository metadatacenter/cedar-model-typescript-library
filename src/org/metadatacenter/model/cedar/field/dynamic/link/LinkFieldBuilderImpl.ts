import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { Iri } from '../../../types/wrapped-types/Iri';
import { LinkField } from './LinkField';
import { LinkFieldBuilder } from './LinkFieldBuilder';
import { LinkFieldImpl } from './LinkFieldImpl';

export class LinkFieldBuilderImpl extends TemplateFieldBuilder implements LinkFieldBuilder {
  private defaultValue: Iri | null = null;

  private constructor() {
    super();
  }

  public static create(): LinkFieldBuilder {
    return new LinkFieldBuilderImpl();
  }

  public withDefaultValue(defaultValue: Iri | null): LinkFieldBuilder {
    this.defaultValue = defaultValue;
    return this;
  }

  public build(): LinkField {
    const linkField = LinkFieldImpl.buildEmpty();
    super.buildInternal(linkField);

    linkField.valueConstraints.defaultValue = this.defaultValue;

    return linkField;
  }
}
