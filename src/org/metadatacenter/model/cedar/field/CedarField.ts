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
import { ValueConstraints } from './ValueConstraints';
import { CedarFieldType } from '../beans/CedarFieldType';

export abstract class CedarField {
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
  public skos_altLabel: Array<string> | null = null;
  public skos_prefLabel: string | null = null;

  public uiInputType: string | null = null;
  public valueConstraints: ValueConstraints = new ValueConstraints();
  public cedarFieldType: CedarFieldType = CedarFieldType.NULL;

  constructor() {}

  abstract getValueRecommendationEnabled(): boolean;

  /**
   * Do not use directly, it will not produce the expected result
   * Use asCedarFieldString(indent) or asCedarFieldObject() instead
   * Will be used by JSON.stringify
   */
  private toJSON() {
    // TODO: include properties based on uiInputType
    const typeSpecificProperties = CedarTemplateFieldContent.PROPERTIES_VERBATIM_LITERAL;

    const uiObject: { [key: string]: string | boolean | null | any[] } = {
      [CedarModel.inputType]: this.uiInputType,
    };

    if (this.getValueRecommendationEnabled()) {
      uiObject[CedarModel.valueRecommendationEnabled] = this.getValueRecommendationEnabled();
    }

    // build the final object
    return {
      [JsonSchema.atId]: this.at_id,
      [JsonSchema.atType]: CedarArtifactType.TEMPLATE_FIELD,
      [JsonSchema.atContext]: CedarTemplateFieldContent.CONTEXT_VERBATIM,
      [CedarModel.type]: JavascriptType.OBJECT,
      [TemplateProperty.title]: this.title,
      [TemplateProperty.description]: this.description,
      [CedarModel.ui]: uiObject,
      [CedarModel.valueConstraints]: this.valueConstraints,
      [JsonSchema.properties]: typeSpecificProperties,
      [JsonSchema.required]: [JsonSchema.atValue], // TODO: this might be dependent on uiInputType
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
      [CedarModel.skosAltLabel]: this.skos_altLabel,
      [CedarModel.skosPrefLabel]: this.skos_prefLabel,
    };
  }

  public asCedarTemplateFieldJSONObject(): object {
    return JSON.parse(JSON.stringify(this));
  }

  public asCedarTemplateFieldJSONString(indent: number = 2): string {
    return JSON.stringify(this, null, indent);
  }

  public asCedarTemplateFieldYamlObject(): object {
    // build the final object
    return {
      id: this.at_id.toJSON(),
      type: CedarArtifactType.TEMPLATE_FIELD.toJSON(),
      [TemplateProperty.title]: this.title,
      [TemplateProperty.description]: this.description,
      [CedarModel.inputType]: this.uiInputType,
      [CedarModel.valueConstraints]: this.valueConstraints,
      [JsonSchema.schemaName]: this.schema_name,
      [JsonSchema.schemaDescription]: this.schema_description,
      [JsonSchema.pavCreatedOn]: this.pav_createdOn?.toJSON(),
      [JsonSchema.pavCreatedBy]: this.pav_createdBy.toJSON(),
      [JsonSchema.pavLastUpdatedOn]: this.pav_lastUpdatedOn?.toJSON(),
      [JsonSchema.oslcModifiedBy]: this.oslc_modifiedBy.toJSON(),
      [JsonSchema.schemaVersion]: this.schema_schemaVersion.toJSON(),
      [JsonSchema.pavVersion]: this.pav_version.toJSON(),
      [JsonSchema.biboStatus]: this.bibo_status.toJSON(),
      [CedarModel.skosAltLabel]: this.skos_altLabel,
      [CedarModel.skosPrefLabel]: this.skos_prefLabel,
    };
  }
}
