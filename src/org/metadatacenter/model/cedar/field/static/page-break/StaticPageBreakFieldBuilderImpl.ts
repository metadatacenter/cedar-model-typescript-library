import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { StaticPageBreakField } from './StaticPageBreakField';
import { StaticPageBreakFieldImpl } from './StaticPageBreakFieldImpl';
import { StaticPageBreakFieldBuilder } from './StaticPageBreakFieldBuilder';

export class StaticPageBreakFieldBuilderImpl extends TemplateFieldBuilder implements StaticPageBreakFieldBuilder {
  private constructor() {
    super();
  }

  public static create(): StaticPageBreakFieldBuilder {
    return new StaticPageBreakFieldBuilderImpl();
  }

  public build(): StaticPageBreakField {
    const staticPageBreakField = StaticPageBreakFieldImpl.buildEmpty();
    super.buildInternal(staticPageBreakField);
    return staticPageBreakField;
  }
}
