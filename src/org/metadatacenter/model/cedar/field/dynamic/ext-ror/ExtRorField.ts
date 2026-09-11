import { TemplateField } from '../../TemplateField';
import { ValueConstraintsIriField } from '../../ValueConstraintsIriField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export interface ExtRorField extends TemplateField {
  get valueConstraints(): ValueConstraintsIriField;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
