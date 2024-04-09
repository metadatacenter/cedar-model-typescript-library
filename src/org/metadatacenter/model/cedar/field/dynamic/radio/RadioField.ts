import { TemplateField } from '../../TemplateField';
import { ValueConstraintsRadioField } from './ValueConstraintsRadioField';
import { ChildDeploymentInfoAlwaysSingleBuilder } from '../../../deployment/ChildDeploymentInfoAlwaysSingleBuilder';

export interface RadioField extends TemplateField {
  get valueConstraints(): ValueConstraintsRadioField;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoAlwaysSingleBuilder;
}
