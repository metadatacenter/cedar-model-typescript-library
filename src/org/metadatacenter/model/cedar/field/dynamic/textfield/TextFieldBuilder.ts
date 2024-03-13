import { CedarTextField } from './CedarTextField';
import { FieldBuilder } from '../../FieldBuilder';

export class TextFieldBuilder extends FieldBuilder {
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

  public withSuggestions(valueRecommendationEnabled: boolean): TextFieldBuilder {
    this.valueRecommendationEnabled = valueRecommendationEnabled;
    return this;
  }

  public build(): CedarTextField {
    const field = CedarTextField.buildEmptyWithNullValues();
    super.buildInternal(field);

    field.valueConstraints.defaultValue = this.defaultValue;
    field.valueConstraints.minLength = this.minLength;
    field.valueConstraints.maxLength = this.maxLength;
    field.valueConstraints.regex = this.regex;
    field.valueRecommendationEnabled = this.valueRecommendationEnabled;

    return field;
  }
}
