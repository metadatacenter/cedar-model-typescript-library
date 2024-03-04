import { SchemaVersion } from '../beans/SchemaVersion';
import { CedarField } from './CedarField';
import { CedarFieldType } from '../beans/CedarFieldType';
import { CedarModel } from '../CedarModel';
import { JsonSchema } from '../constants/JsonSchema';
import { CedarArtifactType } from '../beans/CedarArtifactType';
import { JavascriptType } from '../beans/JavascriptType';
import { TemplateProperty } from '../constants/TemplateProperty';
import { CedarSchema } from '../beans/CedarSchema';
import { CedarStaticTemplateFieldContent } from '../util/serialization/CedarStaticTemplateFieldContent';
import { InputType } from '../constants/InputType';

export class CedarStaticPageBreakField extends CedarField {
  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.STATIC_PAGE_BREAK;
  }

  public static buildEmptyWithNullValues(): CedarStaticPageBreakField {
    return new CedarStaticPageBreakField();
  }

  public static buildEmptyWithDefaultValues(): CedarStaticPageBreakField {
    const r = new CedarStaticPageBreakField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }

  getValueRecommendationEnabled(): boolean {
    return false;
  }

  public toJSON(): Record<string, any> {
    return {
      [JsonSchema.atId]: this.at_id,
      [JsonSchema.atType]: CedarArtifactType.STATIC_TEMPLATE_FIELD,
      [JsonSchema.atContext]: CedarStaticTemplateFieldContent.CONTEXT_VERBATIM,
      [CedarModel.type]: JavascriptType.OBJECT,
      [TemplateProperty.title]: this.title,
      [TemplateProperty.description]: this.description,
      [CedarModel.ui]: {
        [CedarModel.inputType]: InputType.pageBreak,
        [CedarModel.content]: null,
      },
      [JsonSchema.schemaName]: this.schema_name,
      [JsonSchema.schemaDescription]: this.schema_description,
      [JsonSchema.schemaVersion]: this.schema_schemaVersion,
      [JsonSchema.pavCreatedOn]: this.pav_createdOn,
      [JsonSchema.pavCreatedBy]: this.pav_createdBy,
      [JsonSchema.pavLastUpdatedOn]: this.pav_lastUpdatedOn,
      [JsonSchema.oslcModifiedBy]: this.oslc_modifiedBy,
      [TemplateProperty.additionalProperties]: false,
      [CedarModel.skosPrefLabel]: this.skos_prefLabel,
      [CedarModel.schema]: CedarSchema.CURRENT,
    };
  }

  public asCedarTemplateFieldJSONObject(): object {
    return JSON.parse(JSON.stringify(this));
  }

  public asCedarTemplateFieldJSONString(indent: number = 2): string {
    return JSON.stringify(this, null, indent);
  }

  //
  // public asCedarTemplateFieldYamlObject(): object {
  //   // build the final object
  //   return {
  //     id: this.at_id.toJSON(),
  //     type: CedarArtifactType.TEMPLATE_FIELD.toJSON(),
  //     [TemplateProperty.title]: this.title,
  //     [TemplateProperty.description]: this.description,
  //     [CedarModel.inputType]: this.uiInputType,
  //     [CedarModel.valueConstraints]: this.valueConstraints,
  //     [JsonSchema.schemaName]: this.schema_name,
  //     [JsonSchema.schemaDescription]: this.schema_description,
  //     [JsonSchema.pavCreatedOn]: this.pav_createdOn?.toJSON(),
  //     [JsonSchema.pavCreatedBy]: this.pav_createdBy.toJSON(),
  //     [JsonSchema.pavLastUpdatedOn]: this.pav_lastUpdatedOn?.toJSON(),
  //     [JsonSchema.oslcModifiedBy]: this.oslc_modifiedBy.toJSON(),
  //     [JsonSchema.schemaVersion]: this.schema_schemaVersion.toJSON(),
  //     [JsonSchema.pavVersion]: this.pav_version.toJSON(),
  //     [JsonSchema.biboStatus]: this.bibo_status.toJSON(),
  //     [CedarModel.skosAltLabel]: this.skos_altLabel,
  //     [CedarModel.skosPrefLabel]: this.skos_prefLabel,
  //   };
  // }
}
