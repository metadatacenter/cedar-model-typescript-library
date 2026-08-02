import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { ExtPubmedField } from './ExtPubmedField';

export interface ExtPubmedFieldBuilder extends TemplateFieldBuilder {
  build(): ExtPubmedField;
}
