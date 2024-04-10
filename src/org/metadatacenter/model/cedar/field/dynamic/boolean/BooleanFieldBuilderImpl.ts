import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { BooleanFieldBuilder } from './BooleanFieldBuilder';
import { BooleanField } from './BooleanField';
import { BooleanFieldImpl } from './BooleanFieldImpl';

export class BooleanFieldBuilderImpl extends TemplateFieldBuilder implements BooleanFieldBuilder {
  private defaultValue: boolean | null | undefined = undefined;
  private nullEnabled: boolean | null = false;
  private trueLabel: string | null = null;
  private falseLabel: string | null = null;
  private nullLabel: string | null = null;

  private constructor() {
    super();
  }

  withDefaultValue(defaultValue: boolean | null | undefined): BooleanFieldBuilder {
    this.defaultValue = defaultValue;
    return this;
  }

  withNullEnabled(nullEnabled: boolean | null): BooleanFieldBuilder {
    this.nullEnabled = nullEnabled;
    return this;
  }

  withTrueLabel(trueLabel: string | null): BooleanFieldBuilder {
    this.trueLabel = trueLabel;
    return this;
  }

  withFalseLabel(falseLabel: string | null): BooleanFieldBuilder {
    this.falseLabel = falseLabel;
    return this;
  }

  withNullLabel(nullLabel: string | null): BooleanFieldBuilder {
    this.nullLabel = nullLabel;
    return this;
  }

  public static create(): BooleanFieldBuilder {
    return new BooleanFieldBuilderImpl();
  }

  public build(): BooleanField {
    const booleanField = BooleanFieldImpl.buildEmpty();
    super.buildInternal(booleanField);

    booleanField.valueConstraints.defaultValue = this.defaultValue;
    booleanField.valueConstraints.nullLabel = this.nullLabel;
    booleanField.valueConstraints.trueLabel = this.trueLabel;
    booleanField.valueConstraints.falseLabel = this.falseLabel;
    booleanField.valueConstraints.nullEnabled = this.nullEnabled;

    return booleanField;
  }
}
