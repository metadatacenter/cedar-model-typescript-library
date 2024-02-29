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
import { PavVersion } from './beans/PavVersion';
import { CedarArtifactId } from './beans/CedarArtifactId';
import { CedarTemplateContent } from '../serialization/CedarTemplateContent';
import { CedarContainerChildrenInfo } from './beans/CedarContainerChildrenInfo';

export class CedarTemplate {
  public at_id: CedarArtifactId = CedarArtifactId.NULL;
  public title: string | null = null;
  public description: string | null = null;
  public ui: CedarTemplateUI = CedarTemplateUI.EMPTY;
  public required: CedarTemplateRequiredList = CedarTemplateRequiredList.EMPTY;
  public schema_name: string | null = null;
  public schema_description: string | null = null;
  public pav_createdOn: CedarDate | null = CedarDate.forValue(null);
  public pav_createdBy: CedarUser = CedarUser.forValue(null);
  public pav_lastUpdatedOn: CedarDate | null = CedarDate.forValue(null);
  public oslc_modifiedBy: CedarUser = CedarUser.forValue(null);
  public schema_schemaVersion: SchemaVersion = SchemaVersion.NULL;
  public pav_version: PavVersion = PavVersion.NULL;
  public bibo_status: BiboStatus = BiboStatus.NULL;
  public childrenInfo: CedarContainerChildrenInfo = new CedarContainerChildrenInfo();

  private constructor() {}

  public static buildEmptyWithNullValues(): CedarTemplate {
    return new CedarTemplate();
  }

  public static buildEmptyWithDefaultValues(): CedarTemplate {
    const r = new CedarTemplate();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    r.bibo_status = BiboStatus.DRAFT;
    r.pav_version = PavVersion.DEFAULT;
    return r;
  }

  toJSON() {
    return {
      [JsonSchema.atId]: this.at_id,
      [JsonSchema.atType]: CedarArtifactType.TEMPLATE,
      [JsonSchema.atContext]: CedarTemplateContent.CONTEXT_VERBATIM,
      [CedarModel.type]: JavascriptType.OBJECT,
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
      [TemplateProperty.additionalProperties]: false,
      [JsonSchema.pavVersion]: this.pav_version,
      [JsonSchema.biboStatus]: this.bibo_status,
      [CedarModel.schema]: CedarSchema.CURRENT,
    };
  }
}
