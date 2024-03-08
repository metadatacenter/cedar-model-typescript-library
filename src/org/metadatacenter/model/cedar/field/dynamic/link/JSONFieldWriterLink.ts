import { JsonNode } from '../../../util/types/JsonNode';
import { CedarTemplateFieldContent } from '../../../util/serialization/CedarTemplateFieldContent';
import { JsonSchema } from '../../../constants/JsonSchema';
import { JSONFieldWriter } from '../../JSONFieldWriter';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';

export class JSONFieldWriterLink extends JSONFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandPropertiesNodeForJSON(propertiesObject: JsonNode): void {
    propertiesObject[JsonSchema.properties] = CedarTemplateFieldContent.PROPERTIES_VERBATIM_IRI;
  }

  override expandRequiredNodeForJSON(_requiredObject: JsonNode): void {
    // TODO: Should the @id be required in case of a link?
  }
}
