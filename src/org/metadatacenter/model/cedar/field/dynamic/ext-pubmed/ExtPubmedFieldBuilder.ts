import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { Iri } from '../../../types/wrapped-types/Iri';
import { ExtPubmedField } from './ExtPubmedField';

export interface ExtPubmedFieldBuilder extends TemplateFieldBuilder {
  withDefaultValue(defaultValue: Iri | null): ExtPubmedFieldBuilder;

  build(): ExtPubmedField;
}
