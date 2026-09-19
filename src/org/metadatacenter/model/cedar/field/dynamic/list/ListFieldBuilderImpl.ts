import { ListField } from './ListField';
import { ListOption } from './ListOption';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { ListFieldBuilder } from './ListFieldBuilder';
import { MultipleChoiceListFieldImpl } from '../list-multiple-choice/MultipleChoiceListFieldImpl';
import { SingleChoiceListFieldImpl } from '../list-single-choice/SingleChoiceListFieldImpl';

export abstract class ListFieldBuilderImpl extends TemplateFieldBuilder implements ListFieldBuilder {
  protected multipleChoice: boolean = false;
  private defaultValue: string | null = null;
  private literals: Array<ListOption> = [];

  protected constructor() {
    super();
  }

  public withDefaultValue(defaultValue: string | null): this {
    this.defaultValue = defaultValue;
    return this;
  }

  public addListOption(label: string, selectedByDefault?: boolean): this {
    // The caller stating nothing is not the caller stating `false`: only a stated selection is
    // written back, so that an option written both ways stays two entries where a source had two.
    this.literals.push(new ListOption(label, selectedByDefault ?? false, selectedByDefault !== undefined));
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
          // As in the radio builder: an unselected option here is the builder's inference, not the
          // caller's statement, so it stays unstated and unwritten.
          option.statesSelectedByDefault = option.selectedByDefault;
        });
      }
    }

    listField.valueConstraints.defaultValue = this.defaultValue;
    listField.valueConstraints.literals = this.literals;

    return listField;
  }
}
