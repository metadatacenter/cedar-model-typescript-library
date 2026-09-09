import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { Iri } from '../../../types/wrapped-types/Iri';
import { ExtDoiField } from './ExtDoiField';

export interface ExtDoiFieldBuilder extends TemplateFieldBuilder {
  withDefaultValue(defaultValue: Iri | null): ExtDoiFieldBuilder;

  build(): ExtDoiField;
}
