import { JSONWriterBehavior } from '../../../behavior/JSONWriterBehavior';
import { JsonNode, JsonNodeClass } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarWriters } from '../CedarWriters';
import { SimpleYamlSerializer } from './SimpleYamlSerializer';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YAMLAbstractContainerArtifactWriter } from './YAMLAbstractContainerArtifactWriter';
import { TemplateElement } from '../../../model/cedar/element/TemplateElement';

export class YAMLTemplateElementWriter extends YAMLAbstractContainerArtifactWriter {
  private constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  public static getFor(behavior: JSONWriterBehavior, writers: CedarWriters): YAMLTemplateElementWriter {
    return new YAMLTemplateElementWriter(behavior, writers);
  }

  public getYamlAsJsonNode(element: TemplateElement): JsonNode {
    const uiObject: JsonNode = JsonNodeClass.getEmpty();
    // build the final object
    return {
      ...this.macroTypeAndId(element),
      ...this.macroSchemaIdentifier(element),
      ...this.macroNameAndDescription(element),
      ...this.macroStatusAndVersion(element),
      ...uiObject,
      ...this.macroProvenance(element),
      ...this.macroDerivedFrom(element),
      ...this.macroAnnotations(element),
      [YamlKeys.children]: this.getChildListAsJSON(element),
    };
  }

  public getAsYamlString(element: TemplateElement): string {
    return SimpleYamlSerializer.serialize(this.getYamlAsJsonNode(element)).trim();
  }
}
