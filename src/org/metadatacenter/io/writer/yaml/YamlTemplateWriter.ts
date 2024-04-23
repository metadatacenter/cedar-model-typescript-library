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

  public getYamlAsJsonNode(template: Template): JsonNode {
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
      ...this.macroNameAndDescriptionTemplate(template),
      ...this.macroSchemaIdentifier(template),
      ...this.macroId(template),
      ...this.macroStatusAndVersion(template),
      ...uiObject,
      ...this.macroProvenance(template),
      ...this.macroDerivedFrom(template),
      ...this.macroPreviousVersion(template),
      ...this.macroAnnotations(template),
    };
    const children: JsonNode[] = this.getChildListAsJSON(template);
    if (children.length > 0) {
      element[YamlKeys.children] = children;
    }

    return element;
  }

  public getAsYamlString(template: Template): string {
    return SimpleYamlSerializer.serialize(this.getYamlAsJsonNode(template));
  }
}
