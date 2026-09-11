import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { Iri } from '../../../types/wrapped-types/Iri';
import { ExtNihGrantIdField } from './ExtNihGrantIdField';
import { ExtNihGrantIdFieldImpl } from './ExtNihGrantIdFieldImpl';
import { ExtNihGrantIdFieldBuilder } from './ExtNihGrantIdFieldBuilder';

export class ExtNihGrantIdFieldBuilderImpl extends TemplateFieldBuilder implements ExtNihGrantIdFieldBuilder {
  private defaultValue: Iri | null = null;

  private constructor() {
    super();
  }

  public static create(): ExtNihGrantIdFieldBuilder {
    return new ExtNihGrantIdFieldBuilderImpl();
  }

  public withDefaultValue(defaultValue: Iri | null): ExtNihGrantIdFieldBuilder {
    this.defaultValue = defaultValue;
    return this;
  }

  public build(): ExtNihGrantIdField {
    const extNihGrantIdField = ExtNihGrantIdFieldImpl.buildEmpty();
    super.buildInternal(extNihGrantIdField);

    extNihGrantIdField.valueConstraints.defaultValue = this.defaultValue;

    return extNihGrantIdField;
  }
}
