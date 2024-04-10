import { TemplateField } from '../../TemplateField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';
import { ValueConstraintsBooleanField } from './ValueConstraintsBooleanField';

export interface BooleanField extends TemplateField {
  get valueConstraints(): ValueConstraintsBooleanField;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
