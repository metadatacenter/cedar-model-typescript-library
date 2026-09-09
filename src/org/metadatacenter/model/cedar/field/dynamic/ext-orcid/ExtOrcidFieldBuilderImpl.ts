import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { Iri } from '../../../types/wrapped-types/Iri';
import { ExtOrcidField } from './ExtOrcidField';
import { ExtOrcidFieldImpl } from './ExtOrcidFieldImpl';
import { ExtOrcidFieldBuilder } from './ExtOrcidFieldBuilder';

export class ExtOrcidFieldBuilderImpl extends TemplateFieldBuilder implements ExtOrcidFieldBuilder {
  private defaultValue: Iri | null = null;

  private constructor() {
    super();
  }

  public static create(): ExtOrcidFieldBuilder {
    return new ExtOrcidFieldBuilderImpl();
  }

  public withDefaultValue(defaultValue: Iri | null): ExtOrcidFieldBuilder {
    this.defaultValue = defaultValue;
    return this;
  }

  public build(): ExtOrcidField {
    const extOrcidField = ExtOrcidFieldImpl.buildEmpty();
    super.buildInternal(extOrcidField);

    extOrcidField.valueConstraints.defaultValue = this.defaultValue;

    return extOrcidField;
  }
}
