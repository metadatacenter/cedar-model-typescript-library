import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONFieldWriter } from '../../../../../io/writer/JSONFieldWriter';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { CedarStaticPageBreakField } from './CedarStaticPageBreakField';
import { JsonSchema } from '../../../constants/JsonSchema';
import { CedarJSONTemplateFieldContentStatic } from '../../../util/serialization/CedarJSONTemplateFieldContentStatic';
import { CedarModel } from '../../../constants/CedarModel';
import { JavascriptType } from '../../../types/beans/JavascriptType';
import { TemplateProperty } from '../../../constants/TemplateProperty';
import { CedarSchema } from '../../../types/beans/CedarSchema';
import { AdditionalProperties } from '../../../types/beans/AdditionalProperties';

export class JSONFieldWriterStaticPageBreak extends JSONFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(field: CedarStaticPageBreakField): JsonNode {
    return {
      [JsonSchema.atId]: this.atomicWriter.write(field.at_id),
      [JsonSchema.atType]: this.atomicWriter.write(field.cedarArtifactType),
      [JsonSchema.atContext]: CedarJSONTemplateFieldContentStatic.CONTEXT_VERBATIM,
      [CedarModel.type]: this.atomicWriter.write(JavascriptType.OBJECT),
      [TemplateProperty.title]: field.title,
      [TemplateProperty.description]: field.description,
      [CedarModel.ui]: {
        [CedarModel.inputType]: this.atomicWriter.write(field.cedarFieldType.getUiInputType()),
        [CedarModel.content]: null,
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
