import { ListField } from './ListField';
import { ListOption } from './ListOption';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { ListFieldBuilder } from './ListFieldBuilder';
import { MultipleChoiceListFieldImpl } from '../list-multiple-choice/MultipleChoiceListFieldImpl';
import { SingleChoiceListFieldImpl } from '../list-single-choice/SingleChoiceListFieldImpl';

export abstract class ListFieldBuilderImpl extends TemplateFieldBuilder implements ListFieldBuilder {
  protected multipleChoice: boolean = false;
  private literals: Array<ListOption> = [];

  protected constructor() {
    super();
  }

  public addListOption(label: string, selectedByDefault: boolean = false): this {
    this.literals.push(new ListOption(label, selectedByDefault));
    return this;
  }

  public build(): ListField {
    let listField: ListField;
    if (this.multipleChoice) {
      listField = MultipleChoiceListFieldImpl.buildEmpty();
    } else {
      listField = SingleChoiceListFieldImpl.buildEmpty();
    }
    super.buildInternal(listField);

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
