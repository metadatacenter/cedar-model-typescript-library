import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { BooleanField } from './BooleanField';

export interface BooleanFieldBuilder extends TemplateFieldBuilder {
  withDefaultValue(defaultValue: boolean | null | undefined): BooleanFieldBuilder;

  withNullEnabled(nullEnabled: boolean | null): BooleanFieldBuilder;

  withTrueLabel(trueLabel: string | null): BooleanFieldBuilder;

  withFalseLabel(falseLabel: string | null): BooleanFieldBuilder;

  withNullLabel(nullLabel: string | null): BooleanFieldBuilder;

  build(): BooleanField;
}
