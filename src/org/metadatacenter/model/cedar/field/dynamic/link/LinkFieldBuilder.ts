import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { LinkField } from './LinkField';

export class LinkFieldBuilder extends TemplateFieldBuilder {
  public build(): LinkField {
    const linkField = LinkField.buildEmptyWithNullValues();
    super.buildInternal(linkField);

    return linkField;
  }
}
