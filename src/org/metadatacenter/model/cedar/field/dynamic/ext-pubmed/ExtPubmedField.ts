import { TemplateField } from '../../TemplateField';
import { ValueConstraintsIriField } from '../../ValueConstraintsIriField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export interface ExtPubmedField extends TemplateField {
  get valueConstraints(): ValueConstraintsIriField;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
