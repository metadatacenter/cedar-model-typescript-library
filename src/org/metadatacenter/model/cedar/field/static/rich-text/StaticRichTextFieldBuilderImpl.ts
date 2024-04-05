import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { StaticRichTextField } from './StaticRichTextField';
import { StaticRichTextFieldBuilder } from './StaticRichTextFieldBuilder';
import { StaticRichTextFieldImpl } from './StaticRichTextFieldImpl';

export class StaticRichTextFieldBuilderImpl extends TemplateFieldBuilder implements StaticRichTextFieldBuilder {
  private content: string | null = null;

  private constructor() {
    super();
  }

  public static create(): StaticRichTextFieldBuilder {
    return new StaticRichTextFieldBuilderImpl();
  }

  public withContent(content: string | null): StaticRichTextFieldBuilder {
    this.content = content;
    return this;
  }

  public build(): StaticRichTextField {
    const staticRichTextField = StaticRichTextFieldImpl.buildEmpty();
    super.buildInternal(staticRichTextField);
    staticRichTextField.content = this.content;
    return staticRichTextField;
  }
}
