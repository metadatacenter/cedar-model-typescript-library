import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { Iri } from '../../../types/wrapped-types/Iri';
import { ExtRorField } from './ExtRorField';

export interface ExtRorFieldBuilder extends TemplateFieldBuilder {
  withDefaultValue(defaultValue: Iri | null): ExtRorFieldBuilder;

  build(): ExtRorField;
}
