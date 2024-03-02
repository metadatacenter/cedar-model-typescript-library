import { JavascriptType } from '../beans/JavascriptType';
import { BiboStatus } from '../beans/BiboStatus';
import { SchemaVersion } from '../beans/SchemaVersion';
import { JsonSchema } from '../constants/JsonSchema';
import { TemplateProperty } from '../constants/TemplateProperty';
import { CedarUser } from '../beans/CedarUser';
import { CedarDate } from '../beans/CedarDate';
import { CedarArtifactType } from '../beans/CedarArtifactType';
import { CedarModel } from '../CedarModel';
import { CedarSchema } from '../beans/CedarSchema';
import { PavVersion } from '../beans/PavVersion';
import { CedarArtifactId } from '../beans/CedarArtifactId';
import { CedarTemplateFieldContent } from '../util/serialization/CedarTemplateFieldContent';

export class CedarElement {
  public at_id: CedarArtifactId = CedarArtifactId.NULL;
  public title: string | null = null;
  public description: string | null = null;
  public schema_name: string | null = null;
  public schema_description: string | null = null;
  public pav_createdOn: CedarDate | null = CedarDate.forValue(null);
  public pav_createdBy: CedarUser = CedarUser.forValue(null);
  public pav_lastUpdatedOn: CedarDate | null = CedarDate.forValue(null);
  public oslc_modifiedBy: CedarUser = CedarUser.forValue(null);
  public schema_schemaVersion: SchemaVersion = SchemaVersion.NULL;
  public pav_version: PavVersion = PavVersion.NULL;
  public bibo_status: BiboStatus = BiboStatus.NULL;

  private constructor() {}

  public static buildEmptyWithNullValues(): CedarElement {
    return new CedarElement();
  }

  public static buildEmptyWithDefaultValues(): CedarElement {
    const r = new CedarElement();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    r.bibo_status = BiboStatus.DRAFT;
    r.pav_version = PavVersion.DEFAULT;
    return r;
  }

  /**
   * Do not use directly, it will not produce the expected result
   * Use asCedarFieldString(indent) or asCedarFieldObject() instead
   * Will be used by JSON.stringify
   */
  private toJSON() {
    // TODO: include properties based on field type
    const typeSpecificProperties = CedarTemplateFieldContent.PROPERTIES_VERBATIM_LITERAL;

    // build the final object
    return {
      [JsonSchema.atId]: this.at_id,
      [JsonSchema.atType]: CedarArtifactType.TEMPLATE_ELEMENT,
      [JsonSchema.atContext]: CedarTemplateFieldContent.CONTEXT_VERBATIM,
      [CedarModel.type]: JavascriptType.OBJECT,
      [TemplateProperty.title]: this.title,
      [TemplateProperty.description]: this.description,
      [CedarModel.ui]: {
        [CedarModel.inputType]: 'INPUT TYPE COMES HERE', // TODO: this is be dependent on type
      },
      [CedarModel.valueConstraints]: {
        keys: 'VALUE CONSTRAINTS COME HERE', // TODO: this is be dependent on type
      },
      [JsonSchema.properties]: typeSpecificProperties,
      [JsonSchema.required]: [JsonSchema.atValue], // TODO: this might be dependent on type
      [JsonSchema.schemaName]: this.schema_name,
      [JsonSchema.schemaDescription]: this.schema_description,
      [JsonSchema.pavCreatedOn]: this.pav_createdOn,
      [JsonSchema.pavCreatedBy]: this.pav_createdBy,
      [JsonSchema.pavLastUpdatedOn]: this.pav_lastUpdatedOn,
      [JsonSchema.oslcModifiedBy]: this.oslc_modifiedBy,
      [JsonSchema.schemaVersion]: this.schema_schemaVersion,
      [TemplateProperty.additionalProperties]: false,
      [JsonSchema.pavVersion]: this.pav_version,
      [JsonSchema.biboStatus]: this.bibo_status,
      [CedarModel.schema]: CedarSchema.CURRENT,
    };
  }

  public asCedarTemplateElementJSONObject(): object {
    return JSON.parse(JSON.stringify(this));
  }

  public asCedarTemplateElementJSONString(indent: number = 2): string {
    return JSON.stringify(this, null, indent);
  }

  public asCedarElementFieldYamlObject(): object {
    // build the final object
    return {
      id: this.at_id.toJSON(),
      type: CedarArtifactType.TEMPLATE_ELEMENT.toJSON(),
      [TemplateProperty.title]: this.title,
      [TemplateProperty.description]: this.description,
      [JsonSchema.schemaName]: this.schema_name,
      [JsonSchema.schemaDescription]: this.schema_description,
      [JsonSchema.pavCreatedOn]: this.pav_createdOn?.toJSON(),
      [JsonSchema.pavCreatedBy]: this.pav_createdBy.toJSON(),
      [JsonSchema.pavLastUpdatedOn]: this.pav_lastUpdatedOn?.toJSON(),
      [JsonSchema.oslcModifiedBy]: this.oslc_modifiedBy.toJSON(),
      [JsonSchema.schemaVersion]: this.schema_schemaVersion.toJSON(),
      [JsonSchema.pavVersion]: this.pav_version.toJSON(),
      [JsonSchema.biboStatus]: this.bibo_status.toJSON(),
    };
  }
}
