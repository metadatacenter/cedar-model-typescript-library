import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { TextArea } from './TextArea';

export interface TextAreaBuilder extends TemplateFieldBuilder {
  withDefaultValue(defaultValue: string | null): TextAreaBuilder;

  withMinLength(minLength: number | null): TextAreaBuilder;

  withMaxLength(maxLength: number | null): TextAreaBuilder;

  build(): TextArea;
}
