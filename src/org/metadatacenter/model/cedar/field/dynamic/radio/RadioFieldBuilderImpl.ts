import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { RadioOption } from './RadioOption';
import { RadioField } from './RadioField';
import { RadioFieldBuilder } from './RadioFieldBuilder';
import { RadioFieldImpl } from './RadioFieldImpl';

export class RadioFieldBuilderImpl extends TemplateFieldBuilder implements RadioFieldBuilder {
  private literals: Array<RadioOption> = [];

  private constructor() {
    super();
  }

  public static create(): RadioFieldBuilder {
    return new RadioFieldBuilderImpl();
  }

  public addRadioOption(label: string, selectedByDefault: boolean = false): RadioFieldBuilder {
    this.literals.push(new RadioOption(label, selectedByDefault));
    return this;
  }

  public build(): RadioField {
    const radioField = RadioFieldImpl.buildEmpty();
    super.buildInternal(radioField);

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
      });
    }

    radioField.valueConstraints.literals = this.literals;

    return radioField;
  }
}
