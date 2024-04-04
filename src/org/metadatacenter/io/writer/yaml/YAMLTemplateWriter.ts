import { Template } from '../../../model/cedar/template/Template';
import { JsonNode, JsonNodeClass } from '../../../model/cedar/types/basic-types/JsonNode';
import { SimpleYamlSerializer } from './SimpleYamlSerializer';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YAMLAbstractContainerArtifactWriter } from './YAMLAbstractContainerArtifactWriter';
import { YAMLWriterBehavior } from '../../../behavior/YAMLWriterBehavior';
import { CedarYAMLWriters } from './CedarYAMLWriters';

export class YAMLTemplateWriter extends YAMLAbstractContainerArtifactWriter {
  private constructor(behavior: YAMLWriterBehavior, writers: CedarYAMLWriters) {
    super(behavior, writers);
  }

  public static getFor(behavior: YAMLWriterBehavior, writers: CedarYAMLWriters): YAMLTemplateWriter {
    return new YAMLTemplateWriter(behavior, writers);
  }

  public getYamlAsJsonNode(template: Template): JsonNode {
    const uiObject: JsonNode = JsonNodeClass.getEmpty();
    if (template.header !== null) {
      uiObject[YamlKeys.header] = template.header;
    }
    if (template.footer !== null) {
      uiObject[YamlKeys.footer] = template.footer;
    }
    // build the final object
    const element: JsonNode = {
      ...this.macroTypeAndId(template),
      ...this.macroSchemaIdentifier(template),
      ...this.macroNameAndDescription(template),
      ...this.macroStatusAndVersion(template),
      ...uiObject,
      ...this.macroProvenance(template),
      ...this.macroDerivedFrom(template),
      ...this.macroAnnotations(template),
    };
    const children: JsonNode[] = this.getChildListAsJSON(template);
    if (children.length > 0) {
      element[YamlKeys.children] = children;
    }

    return element;
  }

  public getAsYamlString(template: Template): string {
    return SimpleYamlSerializer.serialize(this.getYamlAsJsonNode(template)).trim();
  }
}
