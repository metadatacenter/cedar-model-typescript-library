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
import { CedarTemplateUI } from './beans/CedarTemplateUI';
import { CedarTemplateContext } from './beans/CedarTemplateContext';
import { PavVersion } from './beans/PavVersion';
import { CedarArtifactId } from './beans/CedarArtifactId';

export class CedarTemplate {
  public schema: CedarSchema = CedarSchema.NULL;
  public at_id: CedarArtifactId = CedarArtifactId.NULL;
  public at_type: CedarArtifactType = CedarArtifactType.NULL;
  public at_context_of_template: CedarTemplateContext = CedarTemplateContext.EMPTY;
  public type: JavascriptType = JavascriptType.NULL;
  public title: string | null = null;
  public description: string | null = null;
  public ui: CedarTemplateUI = CedarTemplateUI.EMPTY;
  //public properties: TemplateProperties;
  public required: CedarTemplateRequiredList = CedarTemplateRequiredList.EMPTY;
  public schema_name: string | null = null;
  public schema_description: string | null = null;
  public pav_createdOn: CedarDate | null = CedarDate.forValue(null);
  public pav_createdBy: CedarUser = CedarUser.forValue(null);
  public pav_lastUpdatedOn: CedarDate | null = CedarDate.forValue(null);
  public oslc_modifiedBy: CedarUser = CedarUser.forValue(null);
  public schema_schemaVersion: SchemaVersion = SchemaVersion.NULL;
  public additionalProperties: boolean = false;
  public pav_version: PavVersion = PavVersion.NULL;
  public bibo_status: BiboStatus = BiboStatus.NULL;

  private constructor() {}

  public static buildEmptyWithNullValues(): CedarTemplate {
    return new CedarTemplate();
  }

  public static buildEmptyWithDefaultValues(): CedarTemplate {
    const r = new CedarTemplate();
    r.schema = CedarSchema.CURRENT;
    r.at_type = CedarArtifactType.TEMPLATE;
    r.type = JavascriptType.OBJECT;
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    r.bibo_status = BiboStatus.DRAFT;
    r.pav_version = PavVersion.DEFAULT;
    return r;
  }

  toJSON() {
    return {
      [CedarModel.schema]: this.schema,
      [JsonSchema.atId]: this.at_id,
      [JsonSchema.atType]: this.at_type,
      [JsonSchema.atContext]: this.at_context_of_template,
      [CedarModel.type]: this.type,
      [TemplateProperty.title]: this.title,
      [TemplateProperty.description]: this.description,
      [CedarModel.ui]: this.ui,
      [JsonSchema.required]: this.required,
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
