import { TemplateField } from '../../TemplateField';
import { ValueConstraintsCheckboxField } from './ValueConstraintsCheckboxField';
import { ChildDeploymentInfoAlwaysMultipleBuilder } from '../../../deployment/ChildDeploymentInfoAlwaysMultipleBuilder';

export interface CheckboxField extends TemplateField {
  get valueConstraints(): ValueConstraintsCheckboxField;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoAlwaysMultipleBuilder;
}
