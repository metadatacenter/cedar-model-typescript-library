import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { StaticImageField } from './StaticImageField';

export interface StaticImageFieldBuilder extends TemplateFieldBuilder {
  withContent(content: string | null): StaticImageFieldBuilder;

  withWidth(width: number | null): StaticImageFieldBuilder;

  withHeight(height: number | null): StaticImageFieldBuilder;

  build(): StaticImageField;
}
