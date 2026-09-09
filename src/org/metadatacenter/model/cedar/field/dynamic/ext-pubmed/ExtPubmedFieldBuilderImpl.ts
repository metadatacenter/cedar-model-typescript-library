import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { Iri } from '../../../types/wrapped-types/Iri';
import { ExtPubmedField } from './ExtPubmedField';
import { ExtPubmedFieldImpl } from './ExtPubmedFieldImpl';
import { ExtPubmedFieldBuilder } from './ExtPubmedFieldBuilder';

export class ExtPubmedFieldBuilderImpl extends TemplateFieldBuilder implements ExtPubmedFieldBuilder {
  private defaultValue: Iri | null = null;

  private constructor() {
    super();
  }

  public static create(): ExtPubmedFieldBuilder {
    return new ExtPubmedFieldBuilderImpl();
  }

  public withDefaultValue(defaultValue: Iri | null): ExtPubmedFieldBuilder {
    this.defaultValue = defaultValue;
    return this;
  }

  public build(): ExtPubmedField {
    const extPubmedField = ExtPubmedFieldImpl.buildEmpty();
    super.buildInternal(extPubmedField);

    extPubmedField.valueConstraints.defaultValue = this.defaultValue;

    return extPubmedField;
  }
}
