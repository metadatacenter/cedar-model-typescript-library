import { TemplateField } from '../../TemplateField';
import { ValueConstraintsTextField } from './ValueConstraintsTextField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export interface TextField extends TemplateField {
  get valueConstraints(): ValueConstraintsTextField;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
