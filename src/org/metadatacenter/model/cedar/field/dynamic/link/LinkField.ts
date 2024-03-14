import { SchemaVersion } from '../../../types/wrapped-types/SchemaVersion';
import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraints } from '../../ValueConstraints';

export class LinkField extends TemplateField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.LINK;
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
    this.valueConstraints = new ValueConstraints();
  }

  public static buildEmptyWithNullValues(): LinkField {
    return new LinkField();
  }

  public static buildEmptyWithDefaultValues(): LinkField {
    const r = new LinkField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
