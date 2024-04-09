import { ListFieldBuilder } from '../list/ListFieldBuilder';
import { SingleChoiceListField } from './SingleChoiceListField';

export interface SingleChoiceListFieldBuilder extends ListFieldBuilder {
  addListOption(label: string): this;

  addListOption(label: string, selectedByDefault: boolean): this;

  build(): SingleChoiceListField;
}
