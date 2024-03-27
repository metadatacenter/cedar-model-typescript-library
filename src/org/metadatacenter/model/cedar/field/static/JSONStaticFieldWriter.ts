import { JSONTemplateFieldWriterInternal } from '../../../../io/writer/json/JSONTemplateFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../io/writer/CedarWriters';
import { StaticImageField } from './image/StaticImageField';
import { JsonNode } from '../../types/basic-types/JsonNode';
import { JsonSchema } from '../../constants/JsonSchema';
import { JSONTemplateFieldContentStatic } from '../../util/serialization/JSONTemplateFieldContentStatic';
import { CedarModel } from '../../constants/CedarModel';
import { JavascriptType } from '../../types/wrapped-types/JavascriptType';
import { TemplateProperty } from '../../constants/TemplateProperty';
import { AdditionalProperties } from '../../types/wrapped-types/AdditionalProperties';
import { ArtifactSchema } from '../../types/wrapped-types/ArtifactSchema';
import { TemplateField } from '../TemplateField';

export class JSONStaticFieldWriter extends JSONTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
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
      [JsonSchema.schemaVersion]: this.atomicWriter.write(field.schema_schemaVersion),
      ...this.macroProvenance(field, this.atomicWriter),
      [TemplateProperty.additionalProperties]: this.atomicWriter.write(AdditionalProperties.FALSE),
      ...this.macroStatusAndVersion(field, this.atomicWriter),
      [CedarModel.schema]: this.atomicWriter.write(ArtifactSchema.CURRENT),
      ...this.macroSkos(field),
    };
  }

  protected override macroContext(_field: StaticImageField) {
    return JSONTemplateFieldContentStatic.CONTEXT_VERBATIM;
  }
}
