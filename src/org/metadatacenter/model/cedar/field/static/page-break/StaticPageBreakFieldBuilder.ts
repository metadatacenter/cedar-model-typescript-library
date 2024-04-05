import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { StaticPageBreakField } from './StaticPageBreakField';

export interface StaticPageBreakFieldBuilder extends TemplateFieldBuilder {
  build(): StaticPageBreakField;
}
