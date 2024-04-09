import { TemplateField } from '../../TemplateField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export interface PhoneNumberField extends TemplateField {
  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
