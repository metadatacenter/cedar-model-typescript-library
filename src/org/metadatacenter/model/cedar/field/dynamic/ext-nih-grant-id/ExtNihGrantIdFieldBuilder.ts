import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { Iri } from '../../../types/wrapped-types/Iri';
import { ExtNihGrantIdField } from './ExtNihGrantIdField';

export interface ExtNihGrantIdFieldBuilder extends TemplateFieldBuilder {
  withDefaultValue(defaultValue: Iri | null): ExtNihGrantIdFieldBuilder;

  build(): ExtNihGrantIdField;
}
