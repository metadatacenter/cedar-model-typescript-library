import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONTemplateFieldContentDynamic } from '../../../util/serialization/JSONTemplateFieldContentDynamic';
import { JsonSchema } from '../../../constants/JsonSchema';
import { JSONTemplateFieldWriterInternal } from '../../../../../io/writer/JSONTemplateFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';

export class JSONFieldWriterLink extends JSONTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandPropertiesNodeForJSON(propertiesObject: JsonNode): void {
    propertiesObject[JsonSchema.properties] = JSONTemplateFieldContentDynamic.PROPERTIES_VERBATIM_IRI;
  }

  override expandRequiredNodeForJSON(_requiredObject: JsonNode): void {
    // TODO: Should the @id be required in case of a link?
  }
}
