import { ListField } from './ListField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';

export interface ListFieldBuilder extends TemplateFieldBuilder {
  withMultipleChoice(multipleChoice: boolean): ListFieldBuilder;

  addListOption(label: string): ListFieldBuilder;

  addListOption(label: string, selectedByDefault: boolean): ListFieldBuilder;

  build(): ListField;
}
