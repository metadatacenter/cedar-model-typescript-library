import { ControlledTermField } from './ControlledTermField';
import { ValueConstraintsControlledTermField } from './ValueConstraintsControlledTermField';
import { ControlledTermDefaultValue } from './value-constraint/ControlledTermDefaultValue';
import { ControlledTermOntology } from './value-constraint/ontology/ControlledTermOntology';
import { ControlledTermValueSet } from './value-constraint/value-set/ControlledTermValueSet';
import { ControlledTermClass } from './value-constraint/class/ControlledTermClass';
import { ControlledTermBranch } from './value-constraint/branch/ControlledTermBranch';
import { TemplateFieldBuilder } from '../../TemplateFieldBuilder';
import { ControlledTermFieldBuilder } from './ControlledTermFieldBuilder';
import { ControlledTermFieldImpl } from './ControlledTermFieldImpl';

export class ControlledTermFieldBuilderImpl extends TemplateFieldBuilder implements ControlledTermFieldBuilder {
  private valueConstraints: ValueConstraintsControlledTermField = new ValueConstraintsControlledTermField();
  private valueRecommendationEnabled: boolean = false;

  private constructor() {
    super();
  }

  public static create(): ControlledTermFieldBuilder {
    return new ControlledTermFieldBuilderImpl();
  }

  public withDefaultValue(defaultValue: ControlledTermDefaultValue): ControlledTermFieldBuilder {
    this.valueConstraints.defaultValue = defaultValue;
    return this;
  }

  public addOntology(ontology: ControlledTermOntology): ControlledTermFieldBuilder {
    this.valueConstraints.ontologies.push(ontology);
    return this;
  }

  public addValueSet(valueSet: ControlledTermValueSet): ControlledTermFieldBuilder {
    this.valueConstraints.valueSets.push(valueSet);
    return this;
  }

  public addClass(cls: ControlledTermClass): ControlledTermFieldBuilder {
    this.valueConstraints.classes.push(cls);
    return this;
  }

  public addBranch(branch: ControlledTermBranch): ControlledTermFieldBuilder {
    this.valueConstraints.branches.push(branch);
    return this;
  }

  public withValueRecommendationEnabled(enabled: boolean): ControlledTermFieldBuilder {
    this.valueRecommendationEnabled = enabled;
    return this;
  }

  public build(): ControlledTermField {
    const controlledTermField = ControlledTermFieldImpl.buildEmpty();
    super.buildInternal(controlledTermField);
    controlledTermField.valueConstraints = this.valueConstraints;
    controlledTermField.valueRecommendationEnabled = this.valueRecommendationEnabled;
    return controlledTermField;
  }
}
