import { TemplateField } from '../../TemplateField';
import { ValueConstraintsTextField } from './ValueConstraintsTextField';

export interface TextField extends TemplateField {
  get valueConstraints(): ValueConstraintsTextField;

  get valueRecommendationEnabled(): boolean;

  set valueRecommendationEnabled(boolean);
}
