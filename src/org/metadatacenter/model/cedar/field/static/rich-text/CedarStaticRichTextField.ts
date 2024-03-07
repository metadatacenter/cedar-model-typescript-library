import { SchemaVersion } from '../../../beans/SchemaVersion';
import { CedarField } from '../../CedarField';
import { CedarFieldType } from '../../../beans/CedarFieldType';
import { CedarModel } from '../../../CedarModel';
import { JsonSchema } from '../../../constants/JsonSchema';
import { CedarArtifactType } from '../../../beans/CedarArtifactType';
import { JavascriptType } from '../../../beans/JavascriptType';
import { TemplateProperty } from '../../../constants/TemplateProperty';
import { CedarSchema } from '../../../beans/CedarSchema';
import { CedarStaticTemplateFieldContent } from '../../../util/serialization/CedarStaticTemplateFieldContent';

export class CedarStaticRichTextField extends CedarField {
  public content: string | null = null;

  private constructor() {
    super();
    this.cedarFieldType = CedarFieldType.STATIC_RICH_TEXT;
    this.cedarArtifactType = CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public static buildEmptyWithNullValues(): CedarStaticRichTextField {
    return new CedarStaticRichTextField();
  }

  public static buildEmptyWithDefaultValues(): CedarStaticRichTextField {
    const r = new CedarStaticRichTextField();
    r.schema_schemaVersion = SchemaVersion.CURRENT;
    return r;
  }

  public toJSON(): Record<string, any> {
    return {
      [JsonSchema.atId]: this.at_id,
      [JsonSchema.atType]: this.cedarArtifactType,
      [JsonSchema.atContext]: CedarStaticTemplateFieldContent.CONTEXT_VERBATIM,
      [CedarModel.type]: JavascriptType.OBJECT,
      [TemplateProperty.title]: this.title,
      [TemplateProperty.description]: this.description,
      [CedarModel.ui]: {
        [CedarModel.inputType]: this.cedarFieldType.getUiInputType(),
        [CedarModel.content]: this.content,
      },
      ...this.macroSchemaNameAndDescription(),
      [JsonSchema.schemaVersion]: this.schema_schemaVersion,
      ...this.macroProvenance(),
      [TemplateProperty.additionalProperties]: false,
      ...this.macroSkos(),
      [CedarModel.schema]: CedarSchema.CURRENT,
    };
  }

  public asCedarTemplateFieldJSONObject(): object {
    return JSON.parse(JSON.stringify(this));
  }

  public asCedarTemplateFieldJSONString(indent: number = 2): string {
    return JSON.stringify(this, null, indent);
  }
}
