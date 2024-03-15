import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { StaticRichTextField } from './StaticRichTextField';

export class StaticRichTextFieldBuilder extends TemplateFieldBuilder {
  private content: string | null = null;

  public withContent(content: string | null): StaticRichTextFieldBuilder {
    this.content = content;
    return this;
  }

  public build(): StaticRichTextField {
    const staticRichTextField = StaticRichTextField.buildEmptyWithNullValues();
    super.buildInternal(staticRichTextField);
    staticRichTextField.content = this.content;
    return staticRichTextField;
  }
}
