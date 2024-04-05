import { TemplateField } from '../../TemplateField';
import { ValueConstraintsControlledTermField } from './ValueConstraintsControlledTermField';

export interface ControlledTermField extends TemplateField {
  set valueConstraints(valueConstraints: ValueConstraintsControlledTermField);

  get valueConstraints(): ValueConstraintsControlledTermField;

  set valueRecommendationEnabled(valueRecommendationEnabled: boolean);

  get valueRecommendationEnabled(): boolean;
}
