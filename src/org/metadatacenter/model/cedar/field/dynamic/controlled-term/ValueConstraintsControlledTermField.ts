import { ValueConstraints } from '../../ValueConstraints';
import { ControlledTermDefaultValue } from './value-constraint/ControlledTermDefaultValue';
import { ControlledTermOntology } from './value-constraint/ontology/ControlledTermOntology';
import { ControlledTermValueSet } from './value-constraint/value-set/ControlledTermValueSet';
import { ControlledTermClass } from './value-constraint/class/ControlledTermClass';
import { ControlledTermBranch } from './value-constraint/branch/ControlledTermBranch';

export class ValueConstraintsControlledTermField extends ValueConstraints {
  public defaultValue: ControlledTermDefaultValue | null = null;
  public ontologies: Array<ControlledTermOntology> = [];
  public valueSets: Array<ControlledTermValueSet> = [];
  public classes: Array<ControlledTermClass> = [];
  public branches: Array<ControlledTermBranch> = [];
  public requiredValue: boolean = false;

  public constructor() {
    super();
  }
}
