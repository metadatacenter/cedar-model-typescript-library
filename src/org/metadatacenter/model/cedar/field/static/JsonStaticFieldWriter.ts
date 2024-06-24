import { JsonTemplateFieldWriterInternal } from '../../../../io/writer/json/JsonTemplateFieldWriterInternal';
import { JsonWriterBehavior } from '../../../../behavior/JsonWriterBehavior';
import { StaticImageField } from './image/StaticImageField';
import { JsonNode } from '../../types/basic-types/JsonNode';
import { JsonSchema } from '../../constants/JsonSchema';
import { JsonTemplateFieldContentStatic } from '../../util/serialization/JsonTemplateFieldContentStatic';
import { CedarModel } from '../../constants/CedarModel';
import { JavascriptType } from '../../types/wrapped-types/JavascriptType';
import { TemplateProperty } from '../../constants/TemplateProperty';
import { AdditionalProperties } from '../../types/wrapped-types/AdditionalProperties';
import { ArtifactSchema } from '../../types/wrapped-types/ArtifactSchema';
import { TemplateField } from '../TemplateField';
import { CedarJsonWriters } from '../../../../io/writer/json/CedarJsonWriters';

export class JsonStaticFieldWriter extends JsonTemplateFieldWriterInternal {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  protected expandUiNode(_uiNode: JsonNode, _field: TemplateField): void {}

  protected buildUIObject(field: TemplateField): JsonNode {
    const uiNode: JsonNode = {
      [CedarModel.inputType]: this.atomicWriter.write(field.cedarFieldType.getUiInputType()),
    };
    this.expandUiNode(uiNode, field);
    return {
      [CedarModel.ui]: uiNode,
    } as JsonNode;
  }

  override getAsJsonNode(field: StaticImageField): JsonNode {
    // Build ui wrapper
    const uiObject: JsonNode = this.buildUIObject(field);
    return {
      [JsonSchema.atId]: this.atomicWriter.write(field.at_id),
      [JsonSchema.atType]: this.atomicWriter.write(field.cedarArtifactType),
      [JsonSchema.atContext]: this.macroContext(field),
      [CedarModel.type]: this.atomicWriter.write(JavascriptType.OBJECT),
      [TemplateProperty.title]: field.title,
      [TemplateProperty.description]: field.description,
      ...uiObject,
      ...this.macroSchemaNameAndDescription(field),
      ...this.macroProvenance(field, this.atomicWriter),
      ...this.macroSkos(field),
      [JsonSchema.schemaVersion]: this.atomicWriter.write(field.schema_schemaVersion),
      [TemplateProperty.additionalProperties]: this.atomicWriter.write(AdditionalProperties.FALSE),
      ...this.macroStatusAndVersion(field, this.atomicWriter),
      [CedarModel.schema]: this.atomicWriter.write(ArtifactSchema.CURRENT),
    };
  }

  protected override macroContext(_field: StaticImageField) {
    return JsonTemplateFieldContentStatic.CONTEXT_VERBATIM;
  }
}
