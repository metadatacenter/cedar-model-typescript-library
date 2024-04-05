import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { StaticImageField } from './StaticImageField';
import { StaticImageFieldBuilder } from './StaticImageFieldBuilder';
import { StaticImageFieldImpl } from './StaticImageFieldImpl';

export class StaticImageFieldBuilderImpl extends TemplateFieldBuilder implements StaticImageFieldBuilder {
  private content: string | null = null;

  private constructor() {
    super();
  }

  public static create(): StaticImageFieldBuilder {
    return new StaticImageFieldBuilderImpl();
  }

  public withContent(content: string | null): StaticImageFieldBuilder {
    this.content = content;
    return this;
  }

  public build(): StaticImageField {
    const staticImageField = StaticImageFieldImpl.buildEmpty();
    super.buildInternal(staticImageField);
    staticImageField.content = this.content;
    return staticImageField;
  }
}
