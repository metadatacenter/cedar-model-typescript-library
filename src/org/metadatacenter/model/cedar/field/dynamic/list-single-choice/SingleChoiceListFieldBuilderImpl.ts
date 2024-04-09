import { ListFieldBuilderImpl } from '../list/ListFieldBuilderImpl';
import { SingleChoiceListField } from './SingleChoiceListField';
import { SingleChoiceListFieldBuilder } from './SingleChoiceListFieldBuilder';

export class SingleChoiceListFieldBuilderImpl extends ListFieldBuilderImpl {
  private constructor() {
    super();
    this.multipleChoice = false;
  }

  public static create(): SingleChoiceListFieldBuilder {
    return new SingleChoiceListFieldBuilderImpl();
  }

  public build(): SingleChoiceListField {
    return super.build() as SingleChoiceListField;
  }
}
