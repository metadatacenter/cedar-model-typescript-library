import { TemplateField } from '../../TemplateField';
import { ValueConstraints } from '../../ValueConstraints';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export interface TextArea extends TemplateField {
  get valueConstraints(): ValueConstraints;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
