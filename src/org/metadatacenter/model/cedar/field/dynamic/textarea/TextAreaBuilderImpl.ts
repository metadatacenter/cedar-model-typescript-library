import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { TextArea } from './TextArea';
import { TextAreaImpl } from './TextAreaImpl';
import { TextAreaBuilder } from './TextAreaBuilder';

export class TextAreaBuilderImpl extends TemplateFieldBuilder implements TextAreaBuilder {
  private constructor() {
    super();
  }

  public static create(): TextAreaBuilder {
    return new TextAreaBuilderImpl();
  }

  public build(): TextArea {
    const textArea = TextAreaImpl.buildEmpty();
    super.buildInternal(textArea);

    return textArea;
  }
}
