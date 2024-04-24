import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { SimpleYamlSerializer } from './SimpleYamlSerializer';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YamlAbstractContainerArtifactWriter } from './YamlAbstractContainerArtifactWriter';
import { TemplateElement } from '../../../model/cedar/element/TemplateElement';
import { YamlWriterBehavior } from '../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from './CedarYamlWriters';

export class YamlTemplateElementWriter extends YamlAbstractContainerArtifactWriter {
  private constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  public static getFor(behavior: YamlWriterBehavior, writers: CedarYamlWriters): YamlTemplateElementWriter {
    return new YamlTemplateElementWriter(behavior, writers);
  }

  public getYamlAsJsonNode(element: TemplateElement): JsonNode {
    // build the final object
    const template: JsonNode = {
      ...this.macroType(element),
      ...this.macroNameAndDescription(element),
      ...this.macroSchemaIdentifier(element),
      ...this.macroId(element),
      ...this.macroStatusAndVersion(element),
      ...this.macroPreviousVersion(element),
      ...this.macroDerivedFrom(element),
      ...this.macroProvenance(element),
      ...this.macroAnnotations(element),
    };
    const children: JsonNode[] = this.getChildListAsJSON(element);
    if (children.length > 0) {
      template[YamlKeys.children] = children;
    }
    return template;
  }

  public getAsYamlString(element: TemplateElement): string {
    return SimpleYamlSerializer.serialize(this.getYamlAsJsonNode(element));
  }
}
