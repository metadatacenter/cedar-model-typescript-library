import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { TextArea } from './TextArea';
import { TextAreaImpl } from './TextAreaImpl';
import { TextAreaBuilder } from './TextAreaBuilder';

export class TextAreaBuilderImpl extends TemplateFieldBuilder implements TextAreaBuilder {
  private defaultValue: string | null = null;
  private minLength: number | null = null;
  private maxLength: number | null = null;

  private constructor() {
    super();
  }

  public static create(): TextAreaBuilder {
    return new TextAreaBuilderImpl();
  }

  public withDefaultValue(defaultValue: string | null): TextAreaBuilder {
    this.defaultValue = defaultValue;
    return this;
  }

  public withMinLength(minLength: number | null): TextAreaBuilder {
    this.minLength = minLength;
    return this;
  }

  public withMaxLength(maxLength: number | null): TextAreaBuilder {
    this.maxLength = maxLength;
    return this;
  }

  public build(): TextArea {
    const textArea = TextAreaImpl.buildEmpty();
    super.buildInternal(textArea);

    textArea.valueConstraints.defaultValue = this.defaultValue;
    textArea.valueConstraints.minLength = this.minLength;
    textArea.valueConstraints.maxLength = this.maxLength;

    return textArea;
  }
}
