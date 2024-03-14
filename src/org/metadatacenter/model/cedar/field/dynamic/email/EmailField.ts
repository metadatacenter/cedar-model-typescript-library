import { SchemaVersion } from '../../../types/wrapped-types/SchemaVersion';
import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraints } from '../../ValueConstraints';

export class EmailField extends TemplateField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.EMAIL;
    this.valueConstraints = new ValueConstraints();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): EmailField {
    return new EmailField();
  }

  public static buildEmptyWithDefaultValues(): EmailField {
    const r = new EmailField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
