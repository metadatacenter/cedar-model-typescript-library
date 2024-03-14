import { FieldBuilder } from '../../FieldBuilder';
import { CedarTextArea } from './CedarTextArea';

export class TextAreaBuilder extends FieldBuilder {
  private requiredValue: boolean = false;

  public withRequiredValue(requiredValue: boolean): TextAreaBuilder {
    this.requiredValue = requiredValue;
    return this;
  }

  public build(): CedarTextArea {
    const textArea = CedarTextArea.buildEmptyWithNullValues();
    super.buildInternal(textArea);

    textArea.valueConstraints.requiredValue = this.requiredValue;

    return textArea;
  }
}
