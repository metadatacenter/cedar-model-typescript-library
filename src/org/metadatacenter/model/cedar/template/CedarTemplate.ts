import { JavascriptType } from './beans/JavascriptType';
import { BiboStatus } from './beans/BiboStatus';
import { SchemaVersion } from './beans/SchemaVersion';
import { JsonSchema } from '../constants/JsonSchema';
import { TemplateProperty } from '../constants/TemplateProperty';
import { CedarUser } from './beans/CedarUser';
import { CedarDate } from './beans/CedarDate';
import { CedarArtifactType } from './beans/CedarArtifactTypeValue';
import { CedarModel } from '../CedarModel';
import { CedarSchema } from './beans/CedarSchema';
import { CedarTemplateRequiredList } from './beans/CedarTemplateRequiredList';

export class CedarTemplate {
  public $schema: CedarSchema = CedarSchema.CURRENT;
  public at_id: string | null = null;
  public at_type: CedarArtifactType = CedarArtifactType.TEMPLATE;
  //public at_context: TemplateContext;
  public type: JavascriptType = JavascriptType.OBJECT;
  public title: string | null = null;
  public description: string | null = null;
  //public _ui: CedarCustomUINode;
  //public properties: TemplateProperties;
  public required: CedarTemplateRequiredList = CedarTemplateRequiredList.EMPTY;
  public schema_name: string | null = null;
  public schema_description: string | null = null;
  public pav_createdOn: CedarDate = CedarDate.forValue(null);
  public pav_createdBy: CedarUser = CedarUser.forValue(null);
  public pav_lastUpdatedOn: CedarDate = CedarDate.forValue(null);
  public oslc_modifiedBy: CedarUser = CedarUser.forValue(null);
  public schema_schemaVersion: SchemaVersion = SchemaVersion.CURRENT;
  public additionalProperties: boolean = false;
  public pav_version: string | null = null;
  public bibo_status: BiboStatus = BiboStatus.forValue('unknown');

  public abc: string = JsonSchema.atId;

  toJSON() {
    return {
      [CedarModel.schema]: this.$schema,
      [JsonSchema.atId]: this.at_id,
      [JsonSchema.atType]: this.at_type,
      [CedarModel.type]: this.type,
      [TemplateProperty.title]: this.title,
      [TemplateProperty.description]: this.description,
      [JsonSchema.schemaName]: this.schema_name,
      [JsonSchema.schemaDescription]: this.schema_description,
      [JsonSchema.pavCreatedOn]: this.pav_createdOn,
      [JsonSchema.pavCreatedBy]: this.pav_createdBy,
      [JsonSchema.pavLastUpdatedOn]: this.pav_lastUpdatedOn,
      [JsonSchema.oslcModifiedBy]: this.oslc_modifiedBy,
      [JsonSchema.schemaVersion]: this.schema_schemaVersion,
      [TemplateProperty.additionalProperties]: this.additionalProperties,
      [JsonSchema.pavVersion]: this.pav_version,
      [JsonSchema.biboStatus]: this.bibo_status,
    };
  }
}
