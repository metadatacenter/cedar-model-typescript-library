import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { Iri } from '../../../types/wrapped-types/Iri';
import { ExtRridField } from './ExtRridField';
import { ExtRridFieldImpl } from './ExtRridFieldImpl';
import { ExtRridFieldBuilder } from './ExtRridFieldBuilder';

export class ExtRridFieldBuilderImpl extends TemplateFieldBuilder implements ExtRridFieldBuilder {
  private defaultValue: Iri | null = null;

  private constructor() {
    super();
  }

  public static create(): ExtRridFieldBuilder {
    return new ExtRridFieldBuilderImpl();
  }

  public withDefaultValue(defaultValue: Iri | null): ExtRridFieldBuilder {
    this.defaultValue = defaultValue;
    return this;
  }

  public build(): ExtRridField {
    const extRridField = ExtRridFieldImpl.buildEmpty();
    super.buildInternal(extRridField);

    extRridField.valueConstraints.defaultValue = this.defaultValue;

    return extRridField;
  }
}
