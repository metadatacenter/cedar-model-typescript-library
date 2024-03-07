import { SchemaVersion } from '../../../beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../beans/CedarFieldType';
import { ValueConstraintsLinkField } from './ValueConstraintsLinkField';
import { CedarArtifactType } from '../../../beans/CedarArtifactType';
import { JsonNode } from '../../../util/types/JsonNode';
import { JsonSchema } from '../../../constants/JsonSchema';
import { CedarTemplateFieldContent } from '../../../util/serialization/CedarTemplateFieldContent';

export class CedarLinkField extends CedarField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.LINK;
    this.cedarArtifactType = CedarArtifactType.TEMPLATE_FIELD;
    this.valueConstraints = new ValueConstraintsLinkField();
  }

  public static buildEmptyWithNullValues(): CedarLinkField {
    return new CedarLinkField();
  }

  public static buildEmptyWithDefaultValues(): CedarLinkField {
    const r = new CedarLinkField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }

  protected expandPropertiesNodeForJSON(propertiesObject: JsonNode): void {
    propertiesObject[JsonSchema.properties] = CedarTemplateFieldContent.PROPERTIES_VERBATIM_IRI;
  }

  protected expandRequiredNodeForJSON(requiredObject: JsonNode): void {
    // TODO: Should the @id be required in case of a link?
  }
}
