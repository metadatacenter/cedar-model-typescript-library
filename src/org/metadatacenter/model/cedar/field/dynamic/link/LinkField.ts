import { TemplateField } from '../../TemplateField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export interface LinkField extends TemplateField {
  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
