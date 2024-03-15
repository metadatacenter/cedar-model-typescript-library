import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { StaticImageField } from './StaticImageField';

export class StaticImageFieldBuilder extends TemplateFieldBuilder {
  private content: string | null = null;

  public withContent(content: string | null): StaticImageFieldBuilder {
    this.content = content;
    return this;
  }

  public build(): StaticImageField {
    const staticImageField = StaticImageField.buildEmptyWithNullValues();
    super.buildInternal(staticImageField);
    staticImageField.content = this.content;
    return staticImageField;
  }
}
