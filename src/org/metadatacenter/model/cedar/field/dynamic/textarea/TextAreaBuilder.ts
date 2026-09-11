import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { TextArea } from './TextArea';

export interface TextAreaBuilder extends TemplateFieldBuilder {
  withDefaultValue(defaultValue: string | null): TextAreaBuilder;

  build(): TextArea;
}
