import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { Iri } from '../../../types/wrapped-types/Iri';
import { ExtRorField } from './ExtRorField';
import { ExtRorFieldImpl } from './ExtRorFieldImpl';
import { ExtRorFieldBuilder } from './ExtRorFieldBuilder';

export class ExtRorFieldBuilderImpl extends TemplateFieldBuilder implements ExtRorFieldBuilder {
  private defaultValue: Iri | null = null;

  private constructor() {
    super();
  }

  public static create(): ExtRorFieldBuilder {
    return new ExtRorFieldBuilderImpl();
  }

  public withDefaultValue(defaultValue: Iri | null): ExtRorFieldBuilder {
    this.defaultValue = defaultValue;
    return this;
  }

  public build(): ExtRorField {
    const extRorField = ExtRorFieldImpl.buildEmpty();
    super.buildInternal(extRorField);

    extRorField.valueConstraints.defaultValue = this.defaultValue;

    return extRorField;
  }
}
