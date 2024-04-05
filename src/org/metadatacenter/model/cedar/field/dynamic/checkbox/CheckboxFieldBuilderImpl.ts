import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { CheckboxOption } from './CheckboxOption';
import { CheckboxField } from './CheckboxField';
import { CheckboxFieldBuilder } from './CheckboxFieldBuilder';
import { CheckboxFieldImpl } from './CheckboxFieldImpl';

export class CheckboxFieldBuilderImpl extends TemplateFieldBuilder implements CheckboxFieldBuilder {
  private literals: Array<CheckboxOption> = [];

  private constructor() {
    super();
  }

  public static create(): CheckboxFieldBuilder {
    return new CheckboxFieldBuilderImpl();
  }

  public addCheckboxOption(label: string, selectedByDefault: boolean = false): CheckboxFieldBuilder {
    this.literals.push(new CheckboxOption(label, selectedByDefault));
    return this;
  }

  public build(): CheckboxField {
    const checkboxField = CheckboxFieldImpl.buildEmpty();
    super.buildInternal(checkboxField);

    checkboxField.valueConstraints.literals = this.literals;

    return checkboxField;
  }
}
