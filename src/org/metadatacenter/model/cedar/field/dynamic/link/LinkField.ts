import { TemplateField } from '../../TemplateField';
import { ValueConstraintsIriField } from '../../ValueConstraintsIriField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export interface LinkField extends TemplateField {
  get valueConstraints(): ValueConstraintsIriField;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
