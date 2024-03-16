import { ListField } from './ListField';
import { ListOption } from './ListOption';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';

export class ListFieldBuilder extends TemplateFieldBuilder {
  private multipleChoice: boolean = false;
  private literals: Array<ListOption> = [];

  public withMultipleChoice(multipleChoice: boolean): ListFieldBuilder {
    this.multipleChoice = multipleChoice;
    return this;
  }

  public addListOption(label: string, selectedByDefault: boolean = false): ListFieldBuilder {
    this.literals.push(new ListOption(label, selectedByDefault));
    return this;
  }

  public build(): ListField {
    const listField = ListField.buildEmptyWithNullValues();
    super.buildInternal(listField);

    listField.multipleChoice = this.multipleChoice;

    if (!this.multipleChoice) {
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
    }

    listField.valueConstraints.literals = this.literals;

    return listField;
  }
}
