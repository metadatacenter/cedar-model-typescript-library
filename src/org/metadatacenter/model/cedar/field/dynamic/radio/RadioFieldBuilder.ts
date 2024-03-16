import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { RadioOption } from './RadioOption';
import { RadioField } from './RadioField';

export class RadioFieldBuilder extends TemplateFieldBuilder {
  private literals: Array<RadioOption> = [];

  public addRadioOption(label: string, selectedByDefault: boolean = false): RadioFieldBuilder {
    this.literals.push(new RadioOption(label, selectedByDefault));
    return this;
  }

  public build(): RadioField {
    const radioField = RadioField.buildEmptyWithNullValues();
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
