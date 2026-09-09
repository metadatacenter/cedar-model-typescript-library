import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { Iri } from '../../../types/wrapped-types/Iri';
import { ExtPfasField } from './ExtPfasField';

export interface ExtPfasFieldBuilder extends TemplateFieldBuilder {
  withDefaultValue(defaultValue: Iri | null): ExtPfasFieldBuilder;

  build(): ExtPfasField;
}
