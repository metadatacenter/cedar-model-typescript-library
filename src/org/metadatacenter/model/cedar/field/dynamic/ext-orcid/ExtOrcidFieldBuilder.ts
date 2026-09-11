import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { Iri } from '../../../types/wrapped-types/Iri';
import { ExtOrcidField } from './ExtOrcidField';

export interface ExtOrcidFieldBuilder extends TemplateFieldBuilder {
  withDefaultValue(defaultValue: Iri | null): ExtOrcidFieldBuilder;

  build(): ExtOrcidField;
}
