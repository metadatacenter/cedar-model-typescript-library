import { ControlledTermField } from './ControlledTermField';
import { ControlledTermDefaultValue } from './value-constraint/ControlledTermDefaultValue';
import { ControlledTermOntology } from './value-constraint/ontology/ControlledTermOntology';
import { ControlledTermValueSet } from './value-constraint/value-set/ControlledTermValueSet';
import { ControlledTermClass } from './value-constraint/class/ControlledTermClass';
import { ControlledTermBranch } from './value-constraint/branch/ControlledTermBranch';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';

export interface ControlledTermFieldBuilder extends TemplateFieldBuilder {
  withDefaultValue(defaultValue: ControlledTermDefaultValue): ControlledTermFieldBuilder;

  addOntology(ontology: ControlledTermOntology): ControlledTermFieldBuilder;

  addValueSet(valueSet: ControlledTermValueSet): ControlledTermFieldBuilder;

  addClass(cls: ControlledTermClass): ControlledTermFieldBuilder;

  addBranch(branch: ControlledTermBranch): ControlledTermFieldBuilder;

  withValueRecommendationEnabled(enabled: boolean): ControlledTermFieldBuilder;

  build(): ControlledTermField;
}
