import { TemplateField } from '../../TemplateField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export interface ExtOrcidField extends TemplateField {
  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
