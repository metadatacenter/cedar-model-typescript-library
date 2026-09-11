import { TemplateField } from '../../TemplateField';
import { ValueConstraintsIriField } from '../../ValueConstraintsIriField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export interface ExtDoiField extends TemplateField {
  get valueConstraints(): ValueConstraintsIriField;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
