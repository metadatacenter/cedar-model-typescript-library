import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { StaticSectionBreakField } from './StaticSectionBreakField';

export class StaticSectionBreakFieldBuilder extends TemplateFieldBuilder {
  public build(): StaticSectionBreakField {
    const staticSectionBreakField = StaticSectionBreakField.buildEmptyWithNullValues();
    super.buildInternal(staticSectionBreakField);
    return staticSectionBreakField;
  }
}
