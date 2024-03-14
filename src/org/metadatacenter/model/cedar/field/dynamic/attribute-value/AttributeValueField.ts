import { SchemaVersion } from '../../../types/wrapped-types/SchemaVersion';
import { TemplateField } from '../../TemplateField';
import { CedarFieldType } from '../../../types/cedar-types/CedarFieldType';
import { CedarArtifactType } from '../../../types/cedar-types/CedarArtifactType';
import { ValueConstraints } from '../../ValueConstraints';

export class AttributeValueField extends TemplateField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.ATTRIBUTE_VALUE;
    this.valueConstraints = new ValueConstraints();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): AttributeValueField {
    return new AttributeValueField();
  }

  public static buildEmptyWithDefaultValues(): AttributeValueField {
    const r = new AttributeValueField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
}
