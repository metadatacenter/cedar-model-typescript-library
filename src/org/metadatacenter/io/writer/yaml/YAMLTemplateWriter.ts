import { JSONWriterBehavior } from '../../../behavior/JSONWriterBehavior';
import { Template } from '../../../model/cedar/template/Template';
import { JsonNode, JsonNodeClass } from '../../../model/cedar/types/basic-types/JsonNode';
import { CedarWriters } from '../CedarWriters';
import { SimpleYamlSerializer } from './SimpleYamlSerializer';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YAMLAbstractContainerArtifactWriter } from './YAMLAbstractContainerArtifactWriter';

export class YAMLTemplateWriter extends YAMLAbstractContainerArtifactWriter {
  private constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  public static getFor(behavior: JSONWriterBehavior, writers: CedarWriters): YAMLTemplateWriter {
    return new YAMLTemplateWriter(behavior, writers);
  }

  public getAsYamlNode(template: Template): JsonNode {
    const uiObject: JsonNode = JsonNodeClass.getEmpty();
    if (template.header !== null) {
      uiObject[YamlKeys.header] = template.header;
    }
    if (template.footer !== null) {
      uiObject[YamlKeys.footer] = template.footer;
    }
    // build the final object
    return {
      ...this.macroTypeAndId(template),
      ...this.macroSchemaIdentifier(template),
      ...this.macroNameAndDescription(template),
      ...this.macroStatusAndVersion(template),
      ...uiObject,
      ...this.macroProvenance(template),
      ...this.macroDerivedFrom(template),
      ...this.macroAnnotations(template),
      [YamlKeys.children]: this.getChildListAsJSON(template),
    };
  }

  public getAsYamlString(template: Template): string {
    return SimpleYamlSerializer.serialize(this.getAsYamlNode(template)).trim();
  }
}
