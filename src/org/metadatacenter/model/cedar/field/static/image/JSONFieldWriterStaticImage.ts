import { JsonNode } from '../../../util/types/JsonNode';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { CedarStaticImageField } from './CedarStaticImageField';
import { JsonSchema } from '../../../constants/JsonSchema';
import { CedarStaticTemplateFieldContent } from '../../../util/serialization/CedarStaticTemplateFieldContent';
import { CedarModel } from '../../../CedarModel';
import { JavascriptType } from '../../../beans/JavascriptType';
import { TemplateProperty } from '../../../constants/TemplateProperty';
import { CedarSchema } from '../../../beans/CedarSchema';
import { JSONFieldWriter } from '../../JSONFieldWriter';

export class JSONFieldWriterStaticImage extends JSONFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(field: CedarStaticImageField): JsonNode {
    return {
      [JsonSchema.atId]: this.atomicWriter.write(field.at_id),
      [JsonSchema.atType]: this.atomicWriter.write(field.cedarArtifactType),
      [JsonSchema.atContext]: CedarStaticTemplateFieldContent.CONTEXT_VERBATIM,
      [CedarModel.type]: this.atomicWriter.write(JavascriptType.OBJECT),
      [TemplateProperty.title]: field.title,
      [TemplateProperty.description]: field.description,
      [CedarModel.ui]: {
        [CedarModel.inputType]: this.atomicWriter.write(field.cedarFieldType.getUiInputType()),
        [CedarModel.content]: field.content,
      },
      ...this.macroSchemaNameAndDescription(field),
      [JsonSchema.schemaVersion]: this.atomicWriter.write(field.schema_schemaVersion),
      ...this.macroStatusAndVersion(field, this.atomicWriter),
      ...this.macroProvenance(field, this.atomicWriter),
      [TemplateProperty.additionalProperties]: false,
      ...this.macroSkos(field),
      [CedarModel.schema]: this.atomicWriter.write(CedarSchema.CURRENT),
    };
  }
}
