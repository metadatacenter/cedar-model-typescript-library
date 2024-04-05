import { TextField } from './TextField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';

export interface TextFieldBuilder extends TemplateFieldBuilder {
  withDefaultValue(defaultValue: string | null): TextFieldBuilder;

  withMinLength(minLength: number | null): TextFieldBuilder;

  withMaxLength(maxLength: number | null): TextFieldBuilder;

  withRegex(regex: string | null): TextFieldBuilder;

  withValueRecommendationEnabled(enabled: boolean): TextFieldBuilder;

  build(): TextField;
}
