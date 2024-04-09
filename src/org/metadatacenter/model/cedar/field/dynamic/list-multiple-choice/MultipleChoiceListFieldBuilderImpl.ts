import { ListFieldBuilderImpl } from '../list/ListFieldBuilderImpl';
import { MultipleChoiceListField } from './MultipleChoiceListField';
import { MultipleChoiceListFieldBuilder } from './MultipleChoiceListFieldBuilder';

export class MultipleChoiceListFieldBuilderImpl extends ListFieldBuilderImpl {
  private constructor() {
    super();
    this.multipleChoice = true;
  }

  public static create(): MultipleChoiceListFieldBuilder {
    return new MultipleChoiceListFieldBuilderImpl();
  }

  public build(): MultipleChoiceListField {
    return super.build() as MultipleChoiceListField;
  }
}
