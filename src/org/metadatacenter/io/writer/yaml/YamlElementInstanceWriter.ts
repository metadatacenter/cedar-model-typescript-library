import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { YamlArtifactType } from '../../../model/cedar/types/wrapped-types/YamlArtifactType';
import { ElementInstance } from '../../../model/cedar/template-instance/ElementInstance';
import { YamlWriterBehavior } from '../../../behavior/YamlWriterBehavior';
import { SimpleYamlSerializer } from './SimpleYamlSerializer';
import { CedarYamlWriters } from './CedarYamlWriters';
import { YamlAbstractArtifactWriter } from './YamlAbstractArtifactWriter';

/**
 * Write an element instance that stands on its own, as Java's `YamlArtifactRenderer.renderElementInstanceArtifact`
 * writes one: `type: element-instance`, its name and description when it has them, its identifier, its
 * classes under `instanceType`, the four provenance keys outside the compact form, then its children and
 * its attribute-value fields as a template instance's root writes them.
 */
export class YamlElementInstanceWriter extends YamlAbstractArtifactWriter {
  private constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  public static getFor(behavior: YamlWriterBehavior, writers: CedarYamlWriters): YamlElementInstanceWriter {
    return new YamlElementInstanceWriter(behavior, writers);
  }

  public getYamlAsJsonNode(instance: ElementInstance, isCompact: boolean = false): JsonNode {
    const data = this.writers.getTemplateInstanceWriter().getElementInstanceDataTree(instance.dataContainer, isCompact);
    const node: JsonNode = { [YamlKeys.type]: YamlArtifactType.ELEMENT_INSTANCE.getValue() } as JsonNode;
    if (instance.schema_name !== null) {
      node[YamlKeys.name] = instance.schema_name;
    }
    if (instance.schema_description !== '') {
      node[YamlKeys.description] = instance.schema_description;
    }
    Object.assign(node, this.macroId(instance, isCompact, true));
    const types = instance.dataContainer.types;
    if (types.length > 0) {
      node[YamlKeys.instanceType] = types.length === 1 ? types[0] : [...types];
    }
    Object.assign(node, this.macroProvenance(instance, isCompact), data);
    return node;
  }

  public getAsYamlString(instance: ElementInstance, isCompact: boolean = false): string {
    return SimpleYamlSerializer.serialize(this.getYamlAsJsonNode(instance, isCompact));
  }
}
