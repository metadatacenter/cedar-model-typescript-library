import { Template } from '../../../model/cedar/template/Template';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { SimpleYamlSerializer } from './SimpleYamlSerializer';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YamlAbstractContainerArtifactWriter } from './YamlAbstractContainerArtifactWriter';
import { YamlWriterBehavior } from '../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from './CedarYamlWriters';

export class YamlTemplateWriter extends YamlAbstractContainerArtifactWriter {
  private constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  public static getFor(behavior: YamlWriterBehavior, writers: CedarYamlWriters): YamlTemplateWriter {
    return new YamlTemplateWriter(behavior, writers);
  }

  public getYamlAsJsonNode(template: Template, isCompact: boolean = false): JsonNode {
    const uiObject: JsonNode = JsonNode.getEmpty();
    if (template.header !== null) {
      uiObject[YamlKeys.header] = template.header;
    }
    if (template.footer !== null) {
      uiObject[YamlKeys.footer] = template.footer;
    }
    // build the final object
    const element: JsonNode = {
      ...this.macroType(template),
      ...this.macroNameAndDescription(template),
      ...this.macroSchemaIdentifier(template),
      ...this.macroId(template, isCompact),
      ...this.macroStatusAndVersion(template, isCompact),
      ...uiObject,
      ...this.macroPreviousVersion(template, isCompact),
      ...this.macroDerivedFrom(template, isCompact),
      ...this.macroProvenance(template, isCompact),
      ...this.macroAnnotations(template),
    };
    const children: JsonNode[] = this.getChildListAsJSON(template, isCompact);
    if (children.length > 0) {
      element[YamlKeys.children] = children;
    }

    return element;
  }

  public getAsYamlString(template: Template, isCompact: boolean = false): string {
    return SimpleYamlSerializer.serialize(this.getYamlAsJsonNode(template, isCompact));
  }
}
