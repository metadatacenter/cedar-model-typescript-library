import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { StaticImageField } from './StaticImageField';
import { StaticImageFieldBuilder } from './StaticImageFieldBuilder';
import { StaticImageFieldImpl } from './StaticImageFieldImpl';

export class StaticImageFieldBuilderImpl extends TemplateFieldBuilder implements StaticImageFieldBuilder {
  private content: string | null = null;
  private width: number | null = null;
  private height: number | null = null;

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

  public withWidth(width: number | null): StaticImageFieldBuilder {
    this.width = width;
    return this;
  }

  public withHeight(height: number | null): StaticImageFieldBuilder {
    this.height = height;
    return this;
  }

  public build(): StaticImageField {
    const staticImageField = StaticImageFieldImpl.buildEmpty();
    super.buildInternal(staticImageField);
    staticImageField.content = this.content;
    staticImageField.width = this.width;
    staticImageField.height = this.height;
    return staticImageField;
  }
}
