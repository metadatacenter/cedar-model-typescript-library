import { TemplateField } from '../../TemplateField';
import { ValueConstraintsControlledTermField } from './ValueConstraintsControlledTermField';
import { ChildDeploymentInfoBuilder } from '../../../deployment/ChildDeploymentInfoBuilder';

export interface ControlledTermField extends TemplateField {
  set valueConstraints(valueConstraints: ValueConstraintsControlledTermField);

  get valueConstraints(): ValueConstraintsControlledTermField;

  set valueRecommendationEnabled(valueRecommendationEnabled: boolean);

  get valueRecommendationEnabled(): boolean;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoBuilder;
}
