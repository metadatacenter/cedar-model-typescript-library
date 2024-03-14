import { JsonNode } from '../../../types/basic-types/JsonNode';
import { CedarJSONTemplateFieldContentDynamic } from '../../../util/serialization/CedarJSONTemplateFieldContentDynamic';
import { JsonSchema } from '../../../constants/JsonSchema';
import { JSONFieldWriterInternal } from '../../../../../io/writer/JSONFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';

export class JSONFieldWriterLink extends JSONFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandPropertiesNodeForJSON(propertiesObject: JsonNode): void {
    propertiesObject[JsonSchema.properties] = CedarJSONTemplateFieldContentDynamic.PROPERTIES_VERBATIM_IRI;
  }

  override expandRequiredNodeForJSON(_requiredObject: JsonNode): void {
    // TODO: Should the @id be required in case of a link?
  }
}
