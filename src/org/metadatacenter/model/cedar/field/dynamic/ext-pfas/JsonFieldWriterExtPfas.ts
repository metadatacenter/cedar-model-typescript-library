import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonTemplateFieldContentDynamic } from '../../../util/serialization/JsonTemplateFieldContentDynamic';
import { JsonSchema } from '../../../constants/JsonSchema';
import { JsonTemplateFieldWriterInternal } from '../../../../../io/writer/json/JsonTemplateFieldWriterInternal';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';

export class JsonFieldWriterExtPfas extends JsonTemplateFieldWriterInternal {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  override expandPropertiesNode(propertiesObject: JsonNode): void {
    if (this.behavior.includeSkosNotationForLinksAndControlled()) {
      propertiesObject[JsonSchema.properties] = JsonTemplateFieldContentDynamic.PROPERTIES_VERBATIM_IRI;
    } else {
      propertiesObject[JsonSchema.properties] = JsonTemplateFieldContentDynamic.PROPERTIES_VERBATIM_IRI_NO_SKOS_NOTATION;
    }
  }

  override expandRequiredNode(_requiredObject: JsonNode): void {
    // TODO: Should the @id be required in case of an ext-pfas?
  }
}
