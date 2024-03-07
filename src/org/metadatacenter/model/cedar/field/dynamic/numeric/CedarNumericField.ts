import { SchemaVersion } from '../../../beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../beans/CedarFieldType';
import { CedarArtifactType } from '../../../beans/CedarArtifactType';
import { ValueConstraintsNumericField } from './ValueConstraintsNumericField';
import { JsonNode } from '../../../util/types/JsonNode';
import { JsonSchema } from '../../../constants/JsonSchema';
import { CedarTemplateFieldContent } from '../../../util/serialization/CedarTemplateFieldContent';

export class CedarNumericField extends CedarField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.NUMERIC;
    this.valueConstraints = new ValueConstraintsNumericField();
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CedarNumericField {
    return new CedarNumericField();
  }

  public static buildEmptyWithDefaultValues(): CedarNumericField {
    const r = new CedarNumericField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }
  protected expandPropertiesNodeForJSON(propertiesObject: JsonNode): void {
    propertiesObject[JsonSchema.properties] = CedarTemplateFieldContent.PROPERTIES_VERBATIM_NUMERIC;
  }
  protected expandRequiredNodeForJSON(requiredObject: JsonNode): void {
    requiredObject[JsonSchema.required] = [JsonSchema.atValue, JsonSchema.atType];
  }
}
