import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { ExtPfasField } from './ExtPfasField';

export interface ExtPfasFieldBuilder extends TemplateFieldBuilder {
  build(): ExtPfasField;
}
