import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { Iri } from '../../../types/wrapped-types/Iri';
import { ExtDoiField } from './ExtDoiField';
import { ExtDoiFieldImpl } from './ExtDoiFieldImpl';
import { ExtDoiFieldBuilder } from './ExtDoiFieldBuilder';

export class ExtDoiFieldBuilderImpl extends TemplateFieldBuilder implements ExtDoiFieldBuilder {
  private defaultValue: Iri | null = null;

  private constructor() {
    super();
  }

  public static create(): ExtDoiFieldBuilder {
    return new ExtDoiFieldBuilderImpl();
  }

  public withDefaultValue(defaultValue: Iri | null): ExtDoiFieldBuilder {
    this.defaultValue = defaultValue;
    return this;
  }

  public build(): ExtDoiField {
    const extDoiField = ExtDoiFieldImpl.buildEmpty();
    super.buildInternal(extDoiField);

    extDoiField.valueConstraints.defaultValue = this.defaultValue;

    return extDoiField;
  }
}
