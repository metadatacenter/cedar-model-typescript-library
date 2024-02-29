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
import { PavVersion } from './beans/PavVersion';
import { CedarArtifactId } from './beans/CedarArtifactId';
import { CedarTemplateContent } from '../serialization/CedarTemplateContent';
import { CedarContainerChildrenInfo } from './beans/CedarContainerChildrenInfo';
import { ReaderUtil } from '../../../reader/ReaderUtil';

export class CedarTemplate {
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

  /**
   * Do not use directly, it will not produce the expected result
   * Use asCedarTemplateString(indent) or asCedarTemplateObject() instead
   * Will be used by JSON.stringify
   */
  private toJSON() {
    // clone, because we will need to modify deep content
    const properties = ReaderUtil.deepClone(CedarTemplateContent.PROPERTIES_PARTIAL);

    // Include the IRI mapping
    properties[JsonSchema.atContext][JsonSchema.properties] = {
      ...properties[JsonSchema.atContext][JsonSchema.properties],
      ...this.childrenInfo.getNonStaticIRIMap(),
    };

    // include the field/element definitions
    const extendedProperties = {
      ...properties,
      ...this.childrenInfo.getChildrenDefinitions(),
    };

    // build the final object
    return {
      [JsonSchema.atId]: this.at_id,
      [JsonSchema.atType]: CedarArtifactType.TEMPLATE,
      [JsonSchema.atContext]: CedarTemplateContent.CONTEXT_VERBATIM,
      [CedarModel.type]: JavascriptType.OBJECT,
      [TemplateProperty.title]: this.title,
      [TemplateProperty.description]: this.description,
      [CedarModel.ui]: {
        [CedarModel.order]: this.childrenInfo.getChildrenNames(),
        [CedarModel.propertyLabels]: this.childrenInfo.getPropertyLabelMap(),
        [CedarModel.propertyDescriptions]: this.childrenInfo.getPropertyDescriptionMap(),
      },
      [JsonSchema.properties]: extendedProperties,
      [JsonSchema.required]: [...CedarTemplateContent.REQUIRED_PARTIAL, ...this.childrenInfo.getNonStaticChildrenNames()],
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

  public asCedarTemplateObject(): object {
    return JSON.parse(JSON.stringify(this));
  }

  public asCedarTemplateString(indent: number = 2): string {
    return JSON.stringify(this, null, indent);
  }
}
