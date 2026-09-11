import { TemplateField } from '../../TemplateField';
import { ValueConstraintsLiteralField } from '../../ValueConstraintsLiteralField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export interface EmailField extends TemplateField {
  get valueConstraints(): ValueConstraintsLiteralField;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
