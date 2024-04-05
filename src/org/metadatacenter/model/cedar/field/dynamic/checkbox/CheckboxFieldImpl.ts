import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraintsCheckboxField } from './ValueConstraintsCheckboxField';
import { CheckboxField } from './CheckboxField';

export class CheckboxFieldImpl extends TemplateField implements CheckboxField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsCheckboxField;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.CHECKBOX;
    this.valueConstraints = new ValueConstraintsCheckboxField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmpty(): CheckboxField {
    return new CheckboxFieldImpl();
  }
}
