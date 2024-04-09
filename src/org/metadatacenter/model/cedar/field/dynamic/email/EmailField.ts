import { TemplateField } from '../../TemplateField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export interface EmailField extends TemplateField {
  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
