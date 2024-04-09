import { TemplateField } from '../../TemplateField';
import { ChildDeploymentInfoAlwaysMultipleBuilder } from '../../../deployment/ChildDeploymentInfoAlwaysMultipleBuilder';

export interface AttributeValueField extends TemplateField {
  createDeploymentBuilder(childName: string): ChildDeploymentInfoAlwaysMultipleBuilder;
}
