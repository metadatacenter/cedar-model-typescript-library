import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { Iri } from '../../../types/wrapped-types/Iri';
import { LinkField } from './LinkField';

export interface LinkFieldBuilder extends TemplateFieldBuilder {
  withDefaultValue(defaultValue: Iri | null): LinkFieldBuilder;

  build(): LinkField;
}
