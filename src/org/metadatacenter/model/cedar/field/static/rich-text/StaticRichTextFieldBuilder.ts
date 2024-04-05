import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { StaticRichTextField } from './StaticRichTextField';

export interface StaticRichTextFieldBuilder extends TemplateFieldBuilder {
  withContent(content: string | null): StaticRichTextFieldBuilder;

  build(): StaticRichTextField;
}
