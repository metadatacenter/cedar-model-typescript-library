import { SchemaVersion } from '../../../types/wrapped-types/SchemaVersion';
import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraintsListField } from './ValueConstraintsListField';

export class ListField extends TemplateField {
  // Redeclare valueConstraints with a more specific type
  public valueConstraints: ValueConstraintsListField;
  public multipleChoice: boolean;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.LIST;
    this.valueConstraints = new ValueConstraintsListField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
    this.multipleChoice = false;
  }

  public static buildEmptyWithNullValues(): ListField {
    return new ListField();
  }

  public static buildEmptyWithDefaultValues(): ListField {
    const r = new ListField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
