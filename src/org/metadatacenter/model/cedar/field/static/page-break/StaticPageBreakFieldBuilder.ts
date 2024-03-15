import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { StaticPageBreakField } from './StaticPageBreakField';

export class StaticPageBreakFieldBuilder extends TemplateFieldBuilder {
  public build(): StaticPageBreakField {
    const staticPageBreakField = StaticPageBreakField.buildEmptyWithNullValues();
    super.buildInternal(staticPageBreakField);
    return staticPageBreakField;
  }
}
