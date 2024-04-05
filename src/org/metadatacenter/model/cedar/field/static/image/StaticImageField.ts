import { TemplateField } from '../../TemplateField';

export interface StaticImageField extends TemplateField {
  set content(content: string | null);

  get content(): string | null;
}
