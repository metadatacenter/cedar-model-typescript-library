import { SchemaVersion } from '../../../types/wrapped-types/SchemaVersion';
import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraints } from '../../ValueConstraints';

export class TextArea extends TemplateField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.TEXTAREA;
    this.valueConstraints = new ValueConstraints();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): TextArea {
    return new TextArea();
  }

  public static buildEmptyWithDefaultValues(): TextArea {
    const r = new TextArea();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
