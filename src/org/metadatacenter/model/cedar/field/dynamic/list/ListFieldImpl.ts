import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraintsListField } from './ValueConstraintsListField';
import { ListField } from './ListField';

export abstract class ListFieldImpl extends TemplateField implements ListField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsListField;
  public multipleChoice: boolean;

  protected constructor() {
    super();
    this.cedarFieldType = CedarFieldType.NULL;
    this.valueConstraints = new ValueConstraintsListField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
    this.multipleChoice = false;
  }
}
