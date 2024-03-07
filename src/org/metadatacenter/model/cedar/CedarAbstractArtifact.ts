import { CedarDate } from './beans/CedarDate';
import { CedarUser } from './beans/CedarUser';
import { JsonSchema } from './constants/JsonSchema';
import { PavVersion } from './beans/PavVersion';
import { BiboStatus } from './beans/BiboStatus';
import { JsonNode, JsonNodeClass } from './util/types/JsonNode';

export abstract class CedarAbstractArtifact {
  // provenance
  public pav_createdOn: CedarDate | null = CedarDate.forValue(null);
  public pav_createdBy: CedarUser = CedarUser.forValue(null);
  public pav_lastUpdatedOn: CedarDate | null = CedarDate.forValue(null);
  public oslc_modifiedBy: CedarUser = CedarUser.forValue(null);
  // status and version
  public pav_version: PavVersion = PavVersion.NULL;
  public bibo_status: BiboStatus = BiboStatus.NULL;
  // schema name and description
  public schema_name: string | null = null;
  public schema_description: string | null = null;

  protected macroSchemaNameAndDescription(): JsonNode {
    const ndObject: JsonNode = {
      [JsonSchema.schemaName]: this.schema_name,
      [JsonSchema.schemaDescription]: this.schema_description,
    };
    return ndObject;
  }

  protected macroProvenance(): JsonNode {
    const provObject: JsonNode = {
      [JsonSchema.pavCreatedOn]: this.pav_createdOn,
      [JsonSchema.pavCreatedBy]: this.pav_createdBy,
      [JsonSchema.pavLastUpdatedOn]: this.pav_lastUpdatedOn,
      [JsonSchema.oslcModifiedBy]: this.oslc_modifiedBy,
    };
    return provObject;
  }

  protected macroStatusAndVersion() {
    const svObject: JsonNode = JsonNodeClass.getEmpty();
    if (this.bibo_status !== BiboStatus.NULL) {
      svObject[JsonSchema.biboStatus] = this.bibo_status;
    }
    if (this.pav_version !== PavVersion.NULL) {
      svObject[JsonSchema.pavVersion] = this.pav_version;
    }
    return svObject;
  }
}
