import { TemplateField } from '../../TemplateField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';
import { ValueConstraintsTextArea } from './ValueConstraintsTextArea';

export interface TextArea extends TemplateField {
  get valueConstraints(): ValueConstraintsTextArea;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
