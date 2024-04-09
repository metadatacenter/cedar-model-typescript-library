import { TemplateField } from '../../TemplateField';
import { ValueConstraintsNumericField } from './ValueConstraintsNumericField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export interface NumericField extends TemplateField {
  get valueConstraints(): ValueConstraintsNumericField;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
