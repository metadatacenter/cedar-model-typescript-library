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

  public getYamlAsJsonNode(element: TemplateElement, isCompact: boolean = false): JsonNode {
    // build the final object
    const template: JsonNode = {
      ...this.macroType(element),
      ...this.macroNameAndDescription(element),
      ...this.macroSchemaIdentifier(element),
      ...this.macroId(element, isCompact),
      ...this.macroStatusAndVersion(element, isCompact),
      ...this.macroPreviousVersion(element, isCompact),
      ...this.macroDerivedFrom(element, isCompact),
      ...this.macroProvenance(element, isCompact),
      ...this.macroAnnotations(element),
    };
    const children: JsonNode[] = this.getChildListAsJSON(element, isCompact);
    if (children.length > 0) {
      template[YamlKeys.children] = children;
    }
    return template;
  }

  public getAsYamlString(element: TemplateElement, isCompact: boolean = false): string {
    return SimpleYamlSerializer.serialize(this.getYamlAsJsonNode(element, isCompact));
  }
}
