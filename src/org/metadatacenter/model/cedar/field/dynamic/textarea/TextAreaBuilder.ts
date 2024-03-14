import { FieldBuilder } from '../../FieldBuilder';
import { CedarTextArea } from './CedarTextArea';

export class TextAreaBuilder extends FieldBuilder {
  public build(): CedarTextArea {
    const textArea = CedarTextArea.buildEmptyWithNullValues();
    super.buildInternal(textArea);

    return textArea;
  }
}
