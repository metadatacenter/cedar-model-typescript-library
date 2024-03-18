import { TextField } from './TextField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';

export class TextFieldBuilder extends TemplateFieldBuilder {
  private defaultValue: string | null = null;
  private minLength: number | null = null;
  private maxLength: number | null = null;
  private regex: string | null = null;
  private valueRecommendationEnabled: boolean = false;

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

  public withValueRecommendationEnabled(enabled: boolean): TextFieldBuilder {
    this.valueRecommendationEnabled = enabled;
    return this;
  }

  public build(): TextField {
    const textField = TextField.buildEmptyWithNullValues();
    super.buildInternal(textField);

    textField.valueConstraints.defaultValue = this.defaultValue;
    textField.valueConstraints.minLength = this.minLength;
    textField.valueConstraints.maxLength = this.maxLength;
    textField.valueConstraints.regex = this.regex;
    textField.valueRecommendationEnabled = this.valueRecommendationEnabled;

    return textField;
  }
}
