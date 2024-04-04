import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { SimpleYamlSerializer } from './SimpleYamlSerializer';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YAMLAbstractContainerArtifactWriter } from './YAMLAbstractContainerArtifactWriter';
import { TemplateElement } from '../../../model/cedar/element/TemplateElement';
import { YAMLWriterBehavior } from '../../../behavior/YAMLWriterBehavior';
import { CedarYAMLWriters } from './CedarYAMLWriters';

export class YAMLTemplateElementWriter extends YAMLAbstractContainerArtifactWriter {
  private constructor(behavior: YAMLWriterBehavior, writers: CedarYAMLWriters) {
    super(behavior, writers);
  }

  public static getFor(behavior: YAMLWriterBehavior, writers: CedarYAMLWriters): YAMLTemplateElementWriter {
    return new YAMLTemplateElementWriter(behavior, writers);
  }

  public getYamlAsJsonNode(element: TemplateElement): JsonNode {
    // build the final object
    const template: JsonNode = {
      ...this.macroTypeAndId(element),
      ...this.macroSchemaIdentifier(element),
      ...this.macroNameAndDescription(element),
      ...this.macroStatusAndVersion(element),
      ...this.macroProvenance(element),
      ...this.macroDerivedFrom(element),
      ...this.macroAnnotations(element),
    };
    const children: JsonNode[] = this.getChildListAsJSON(element);
    if (children.length > 0) {
      template[YamlKeys.children] = children;
    }
    return template;
  }

  public getAsYamlString(element: TemplateElement): string {
    return SimpleYamlSerializer.serialize(this.getYamlAsJsonNode(element)).trim();
  }
}
