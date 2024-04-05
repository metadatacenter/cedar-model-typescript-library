import { TemplateField } from '../../TemplateField';

export interface StaticRichTextField extends TemplateField {
  set content(content: string | null);

  get content(): string | null;
}
