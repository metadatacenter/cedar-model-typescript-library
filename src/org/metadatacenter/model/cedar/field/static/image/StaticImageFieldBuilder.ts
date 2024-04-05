import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { StaticImageField } from './StaticImageField';

export interface StaticImageFieldBuilder extends TemplateFieldBuilder {
  withContent(content: string | null): StaticImageFieldBuilder;

  build(): StaticImageField;
}
