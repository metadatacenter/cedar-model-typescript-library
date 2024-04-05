import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { StaticSectionBreakField } from './StaticSectionBreakField';
import { StaticSectionBreakFieldBuilder } from './StaticSectionBreakFieldBuilder';
import { StaticSectionBreakFieldImpl } from './StaticSectionBreakFieldImpl';

export class StaticSectionBreakFieldBuilderImpl extends TemplateFieldBuilder implements StaticSectionBreakFieldBuilder {
  private constructor() {
    super();
  }

  public static create(): StaticSectionBreakFieldBuilder {
    return new StaticSectionBreakFieldBuilderImpl();
  }

  public build(): StaticSectionBreakField {
    const staticSectionBreakField = StaticSectionBreakFieldImpl.buildEmpty();
    super.buildInternal(staticSectionBreakField);
    return staticSectionBreakField;
  }
}
