import { TextField } from './TextField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { TextFieldBuilder } from './TextFieldBuilder';
import { TextFieldImpl } from './TextFieldImpl';

export class TextFieldBuilderImpl extends TemplateFieldBuilder implements TextFieldBuilder {
  private defaultValue: string | null = null;
  private minLength: number | null = null;
  private maxLength: number | null = null;
  private regex: string | null = null;

  private constructor() {
    super();
  }

  public static create(): TextFieldBuilder {
    return new TextFieldBuilderImpl();
  }

  public withDefaultValue(defaultValue: string | null): TextFieldBuilder {
    this.defaultValue = defaultValue;
    return this;
  }

  public withMinLength(minLength: number | null): TextFieldBuilder {
    this.minLength = minLength;
    return this;
  }

  public withMaxLength(maxLength: number | null): TextFieldBuilder {
    this.maxLength = maxLength;
    return this;
  }

  public withRegex(regex: string | null): TextFieldBuilder {
    this.regex = regex;
    return this;
  }

  public build(): TextField {
    const textField = TextFieldImpl.buildEmpty();
    super.buildInternal(textField);

    textField.valueConstraints.defaultValue = this.defaultValue;
    textField.valueConstraints.minLength = this.minLength;
    textField.valueConstraints.maxLength = this.maxLength;
    textField.valueConstraints.regex = this.regex;

    return textField;
  }
}
