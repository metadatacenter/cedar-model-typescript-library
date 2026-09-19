import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { CheckboxOption } from './CheckboxOption';
import { CheckboxField } from './CheckboxField';
import { CheckboxFieldBuilder } from './CheckboxFieldBuilder';
import { CheckboxFieldImpl } from './CheckboxFieldImpl';

export class CheckboxFieldBuilderImpl extends TemplateFieldBuilder implements CheckboxFieldBuilder {
  private defaultValue: string | null = null;

  private literals: Array<CheckboxOption> = [];

  private constructor() {
    super();
  }

  public static create(): CheckboxFieldBuilder {
    return new CheckboxFieldBuilderImpl();
  }

  public addCheckboxOption(label: string, selectedByDefault?: boolean): CheckboxFieldBuilder {
    // The caller stating nothing is not the caller stating `false`: only a stated selection is
    // written back, so that an option written both ways stays two entries where a source had two.
    this.literals.push(new CheckboxOption(label, selectedByDefault ?? false, selectedByDefault !== undefined));
    return this;
  }

  public withDefaultValue(defaultValue: string | null): CheckboxFieldBuilder {
    this.defaultValue = defaultValue;
    return this;
  }

  public build(): CheckboxField {
    const checkboxField = CheckboxFieldImpl.buildEmpty();
    super.buildInternal(checkboxField);

    checkboxField.valueConstraints.defaultValue = this.defaultValue;

    checkboxField.valueConstraints.literals = this.literals;

    return checkboxField;
  }
}
