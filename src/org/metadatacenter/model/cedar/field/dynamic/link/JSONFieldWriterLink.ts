import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONTemplateFieldContentDynamic } from '../../../util/serialization/JSONTemplateFieldContentDynamic';
import { JsonSchema } from '../../../constants/JsonSchema';
import { JSONTemplateFieldWriterInternal } from '../../../../../io/writer/json/JSONTemplateFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarJSONWriters } from '../../../../../io/writer/json/CedarJSONWriters';

export class JSONFieldWriterLink extends JSONTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarJSONWriters) {
    super(behavior, writers);
  }

  override expandPropertiesNodeForJSON(propertiesObject: JsonNode): void {
    if (this.behavior.includeSkosNotationForLinksAndControlled()) {
      propertiesObject[JsonSchema.properties] = JSONTemplateFieldContentDynamic.PROPERTIES_VERBATIM_IRI;
    } else {
      propertiesObject[JsonSchema.properties] = JSONTemplateFieldContentDynamic.PROPERTIES_VERBATIM_IRI_NO_SKOS_NOTATION;
    }
  }

  override expandRequiredNodeForJSON(_requiredObject: JsonNode): void {
    // TODO: Should the @id be required in case of a link?
  }
}
