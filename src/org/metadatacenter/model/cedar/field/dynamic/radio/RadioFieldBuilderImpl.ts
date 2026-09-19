import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { RadioOption } from './RadioOption';
import { RadioField } from './RadioField';
import { RadioFieldBuilder } from './RadioFieldBuilder';
import { RadioFieldImpl } from './RadioFieldImpl';

export class RadioFieldBuilderImpl extends TemplateFieldBuilder implements RadioFieldBuilder {
  private defaultValue: string | null = null;

  private literals: Array<RadioOption> = [];

  private constructor() {
    super();
  }

  public static create(): RadioFieldBuilder {
    return new RadioFieldBuilderImpl();
  }

  public addRadioOption(label: string, selectedByDefault?: boolean): RadioFieldBuilder {
    // The caller stating nothing is not the caller stating `false`: only a stated selection is
    // written back, so that an option written both ways stays two entries where a source had two.
    this.literals.push(new RadioOption(label, selectedByDefault ?? false, selectedByDefault !== undefined));
    return this;
  }

  public withDefaultValue(defaultValue: string | null): RadioFieldBuilder {
    this.defaultValue = defaultValue;
    return this;
  }

  public build(): RadioField {
    const radioField = RadioFieldImpl.buildEmpty();
    super.buildInternal(radioField);

    radioField.valueConstraints.defaultValue = this.defaultValue;

    // Find the last option that was marked as selectedByDefault
    let lastSelectedIndex = -1;
    for (let i = this.literals.length - 1; i >= 0; i--) {
      if (this.literals[i].selectedByDefault) {
        lastSelectedIndex = i;
        break;
      }
    }

    if (lastSelectedIndex !== -1) {
      this.literals.forEach((option, index) => {
        option.selectedByDefault = index === lastSelectedIndex;
        // The unselected ones are the builder's inference rather than the caller's statement, so
        // they stay unstated and unwritten, as they were before a stated selection was kept.
        option.statesSelectedByDefault = option.selectedByDefault;
      });
    }

    radioField.valueConstraints.literals = this.literals;

    return radioField;
  }
}
