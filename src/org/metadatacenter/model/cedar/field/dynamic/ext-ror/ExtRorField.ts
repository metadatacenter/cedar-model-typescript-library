import { TemplateField } from '../../TemplateField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export interface ExtRorField extends TemplateField {
  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
