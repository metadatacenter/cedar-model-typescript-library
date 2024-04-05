import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { TextArea } from './TextArea';

export interface TextAreaBuilder extends TemplateFieldBuilder {
  build(): TextArea;
}
