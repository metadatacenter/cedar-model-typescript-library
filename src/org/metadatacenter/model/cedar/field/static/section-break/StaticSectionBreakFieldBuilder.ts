import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { StaticSectionBreakField } from './StaticSectionBreakField';

export interface StaticSectionBreakFieldBuilder extends TemplateFieldBuilder {
  build(): StaticSectionBreakField;
}
