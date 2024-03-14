import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONFieldWriterInternal } from '../../../../../io/writer/JSONFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { CedarStaticYoutubeField } from './CedarStaticYoutubeField';
import { JsonSchema } from '../../../constants/JsonSchema';
import { CedarJSONTemplateFieldContentStatic } from '../../../util/serialization/CedarJSONTemplateFieldContentStatic';
import { CedarModel } from '../../../constants/CedarModel';
import { JavascriptType } from '../../../types/beans/JavascriptType';
import { TemplateProperty } from '../../../constants/TemplateProperty';
import { CedarSchema } from '../../../types/beans/CedarSchema';
import { AdditionalProperties } from '../../../types/beans/AdditionalProperties';

export class JSONFieldWriterStaticYoutube extends JSONFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(field: CedarStaticYoutubeField): JsonNode {
    return {
      [JsonSchema.atId]: this.atomicWriter.write(field.at_id),
      [JsonSchema.atType]: this.atomicWriter.write(field.cedarArtifactType),
      [JsonSchema.atContext]: CedarJSONTemplateFieldContentStatic.CONTEXT_VERBATIM,
      [CedarModel.type]: this.atomicWriter.write(JavascriptType.OBJECT),
      [TemplateProperty.title]: field.title,
      [TemplateProperty.description]: field.description,
      [CedarModel.ui]: {
        [CedarModel.inputType]: this.atomicWriter.write(field.cedarFieldType.getUiInputType()),
        [CedarModel.content]: field.videoId,
        [CedarModel.size]: {
          [CedarModel.width]: field.width,
          [CedarModel.height]: field.height,
        },
      },
      ...this.macroSchemaNameAndDescription(field),
      [JsonSchema.schemaVersion]: this.atomicWriter.write(field.schema_schemaVersion),
      ...this.macroProvenance(field, this.atomicWriter),
      [TemplateProperty.additionalProperties]: this.atomicWriter.write(AdditionalProperties.FALSE),
      ...this.macroSkos(field),
      [CedarModel.schema]: this.atomicWriter.write(CedarSchema.CURRENT),
    };
  }
}
