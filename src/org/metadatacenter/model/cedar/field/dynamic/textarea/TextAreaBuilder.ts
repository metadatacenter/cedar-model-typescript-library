import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { TextArea } from './TextArea';

export class TextAreaBuilder extends TemplateFieldBuilder {
  public build(): TextArea {
    const textArea = TextArea.buildEmptyWithNullValues();
    super.buildInternal(textArea);

    return textArea;
  }
}
