import { JavascriptType } from '../beans/JavascriptType';
import { SchemaVersion } from '../beans/SchemaVersion';
import { JsonSchema } from '../constants/JsonSchema';
import { TemplateProperty } from '../constants/TemplateProperty';
import { CedarArtifactType } from '../beans/CedarArtifactType';
import { CedarModel } from '../CedarModel';
import { CedarSchema } from '../beans/CedarSchema';
import { CedarArtifactId } from '../beans/CedarArtifactId';
import { CedarTemplateFieldContent } from '../util/serialization/CedarTemplateFieldContent';
import { ValueConstraints } from './ValueConstraints';
import { CedarFieldType } from '../beans/CedarFieldType';
import { CedarTextField } from './textfield/CedarTextField';
import { CedarAbstractArtifact } from '../CedarAbstractArtifact';

export abstract class CedarField extends CedarAbstractArtifact {
  public at_id: CedarArtifactId = CedarArtifactId.NULL;
  public title: string | null = null;
  public description: string | null = null;
  public schema_schemaVersion: SchemaVersion = SchemaVersion.NULL;
  public skos_altLabel: Array<string> | null = null;
  public skos_prefLabel: string | null = null;

  public valueConstraints: ValueConstraints = new ValueConstraints();
  public cedarFieldType: CedarFieldType = CedarFieldType.NULL;

  protected macroSkos(): Record<string, any> {
    const skosObject: Record<string, any> = {};
    if (this.skos_altLabel !== null && this.skos_altLabel.length > 0) {
      skosObject[CedarModel.skosAltLabel] = this.skos_altLabel;
    }
    if (this.skos_prefLabel !== null) {
      skosObject[CedarModel.skosPrefLabel] = this.skos_prefLabel;
    }
    return skosObject;
  }

  /**
   * Do not use directly, it will not produce the expected result
   * Use asCedarFieldString(indent) or asCedarFieldObject() instead
   * Will be used by JSON.stringify
   */
  public toJSON(): Record<string, any> {
    let propertiesObject: Record<string, any> = {
      [JsonSchema.properties]: CedarTemplateFieldContent.PROPERTIES_VERBATIM_LITERAL,
    };
    let requiredObject: Record<string, any> = {
      [JsonSchema.required]: [JsonSchema.atValue],
    };
    const uiObject: Record<string, any> = {
      [CedarModel.ui]: {
        [CedarModel.inputType]: this.cedarFieldType.getUiInputType(),
      },
    };

    if (this.cedarFieldType == CedarFieldType.LINK) {
      propertiesObject = {
        [JsonSchema.properties]: CedarTemplateFieldContent.PROPERTIES_VERBATIM_IRI,
      };
      // TODO: Should the @id be required in case of a link?
      requiredObject = {};
    } else if (this.cedarFieldType == CedarFieldType.TEXT && this instanceof CedarTextField) {
      if (this.valueRecommendationEnabled) {
        uiObject[CedarModel.ui][CedarModel.valueRecommendationEnabled] = this.valueRecommendationEnabled;
      }
    }

    // build the final object
    return {
      [JsonSchema.atId]: this.at_id,
      [JsonSchema.atType]: CedarArtifactType.TEMPLATE_FIELD,
      [JsonSchema.atContext]: CedarTemplateFieldContent.CONTEXT_VERBATIM,
      [CedarModel.type]: JavascriptType.OBJECT,
      [TemplateProperty.title]: this.title,
      [TemplateProperty.description]: this.description,
      ...uiObject,
      [CedarModel.valueConstraints]: this.valueConstraints,
      ...propertiesObject,
      ...requiredObject,
      ...this.macroSchemaNameAndDescription(),
      ...this.macroProvenance(),
      [JsonSchema.schemaVersion]: this.schema_schemaVersion,
      [TemplateProperty.additionalProperties]: false,
      ...this.macroStatusAndVersion(),
      [CedarModel.schema]: CedarSchema.CURRENT,
      ...this.macroSkos(),
    };
  }

  public asCedarTemplateFieldJSONObject(): object {
    return JSON.parse(JSON.stringify(this));
  }

  public asCedarTemplateFieldJSONString(indent: number = 2): string {
    return JSON.stringify(this, null, indent);
  }

  // public asCedarTemplateFieldYamlObject(): object {
  //   // build the final object
  //   return {
  //     id: this.at_id.toJSON(),
  //     type: CedarArtifactType.TEMPLATE_FIELD.toJSON(),
  //     [TemplateProperty.title]: this.title,
  //     [TemplateProperty.description]: this.description,
  //     [CedarModel.inputType]: this.cedarFieldType.getUiInputType(),
  //     [CedarModel.valueConstraints]: this.valueConstraints?.toJSON(),
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
