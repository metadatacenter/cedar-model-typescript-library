import { ListFieldBuilder } from '../list/ListFieldBuilder';
import { MultipleChoiceListField } from './MultipleChoiceListField';

export interface MultipleChoiceListFieldBuilder extends ListFieldBuilder {
  addListOption(label: string): this;

  addListOption(label: string, selectedByDefault: boolean): this;

  build(): MultipleChoiceListField;
}
