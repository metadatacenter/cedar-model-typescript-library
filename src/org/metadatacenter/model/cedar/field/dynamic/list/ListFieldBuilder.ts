import { ListField } from './ListField';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';

export interface ListFieldBuilder extends TemplateFieldBuilder {
  addListOption(label: string): this;

  addListOption(label: string, selectedByDefault: boolean): this;

  build(): ListField;
}
