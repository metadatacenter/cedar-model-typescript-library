import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { CheckboxOption } from './CheckboxOption';
import { CheckboxField } from './CheckboxField';

export class CheckboxFieldBuilder extends TemplateFieldBuilder {
  private literals: Array<CheckboxOption> = [];

  public addCheckboxOption(label: string, selectedByDefault: boolean = false): CheckboxFieldBuilder {
    this.literals.push(new CheckboxOption(label, selectedByDefault));
    return this;
  }

  public build(): CheckboxField {
    const checkboxField = CheckboxField.buildEmptyWithNullValues();
    super.buildInternal(checkboxField);

    checkboxField.valueConstraints.literals = this.literals;

    return checkboxField;
  }
}
