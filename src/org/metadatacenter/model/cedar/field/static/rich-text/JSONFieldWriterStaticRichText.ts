import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONFieldWriterInternal } from '../../../../../io/writer/JSONFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { StaticRichTextField } from './StaticRichTextField';
import { JsonSchema } from '../../../constants/JsonSchema';
import { JSONTemplateFieldContentStatic } from '../../../util/serialization/JSONTemplateFieldContentStatic';
import { CedarModel } from '../../../constants/CedarModel';
import { JavascriptType } from '../../../types/wrapped-types/JavascriptType';
import { TemplateProperty } from '../../../constants/TemplateProperty';
import { ArtifactSchema } from '../../../types/wrapped-types/ArtifactSchema';
import { AdditionalProperties } from '../../../types/wrapped-types/AdditionalProperties';

export class JSONFieldWriterStaticRichText extends JSONFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(field: StaticRichTextField): JsonNode {
    return {
      [JsonSchema.atId]: this.atomicWriter.write(field.at_id),
      [JsonSchema.atType]: this.atomicWriter.write(field.cedarArtifactType),
      [JsonSchema.atContext]: JSONTemplateFieldContentStatic.CONTEXT_VERBATIM,
      [CedarModel.type]: this.atomicWriter.write(JavascriptType.OBJECT),
      [TemplateProperty.title]: field.title,
      [TemplateProperty.description]: field.description,
      [CedarModel.ui]: {
        [CedarModel.inputType]: this.atomicWriter.write(field.cedarFieldType.getUiInputType()),
        [CedarModel.content]: field.content,
      },
      ...this.macroSchemaNameAndDescription(field),
      [JsonSchema.schemaVersion]: this.atomicWriter.write(field.schema_schemaVersion),
      ...this.macroProvenance(field, this.atomicWriter),
      [TemplateProperty.additionalProperties]: this.atomicWriter.write(AdditionalProperties.FALSE),
      ...this.macroSkos(field),
      [CedarModel.schema]: this.atomicWriter.write(ArtifactSchema.CURRENT),
    };
  }
}
