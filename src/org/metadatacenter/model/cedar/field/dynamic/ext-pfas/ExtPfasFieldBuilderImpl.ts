import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { Iri } from '../../../types/wrapped-types/Iri';
import { ExtPfasField } from './ExtPfasField';
import { ExtPfasFieldBuilder } from './ExtPfasFieldBuilder';
import { ExtPfasFieldImpl } from './ExtPfasFieldImpl';

export class ExtPfasFieldBuilderImpl extends TemplateFieldBuilder implements ExtPfasFieldBuilder {
  private defaultValue: Iri | null = null;

  private constructor() {
    super();
  }

  public static create(): ExtPfasFieldBuilder {
    return new ExtPfasFieldBuilderImpl();
  }

  public withDefaultValue(defaultValue: Iri | null): ExtPfasFieldBuilder {
    this.defaultValue = defaultValue;
    return this;
  }

  public build(): ExtPfasField {
    const extPfasField = ExtPfasFieldImpl.buildEmpty();
    super.buildInternal(extPfasField);

    extPfasField.valueConstraints.defaultValue = this.defaultValue;

    return extPfasField;
  }
}
