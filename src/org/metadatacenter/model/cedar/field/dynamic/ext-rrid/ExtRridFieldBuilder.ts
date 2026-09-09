import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { Iri } from '../../../types/wrapped-types/Iri';
import { ExtRridField } from './ExtRridField';

export interface ExtRridFieldBuilder extends TemplateFieldBuilder {
  withDefaultValue(defaultValue: Iri | null): ExtRridFieldBuilder;

  build(): ExtRridField;
}
