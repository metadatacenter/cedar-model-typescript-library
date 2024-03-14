import { AbstractArtifactWriter } from './AbstractArtifactWriter';
import { JsonNode, JsonNodeClass } from '../../model/cedar/types/basic-types/JsonNode';
import { CedarContainerChildInfo } from '../../model/cedar/types/beans/CedarContainerChildInfo';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { CedarModel } from '../../model/cedar/constants/CedarModel';
import { CedarField } from '../../model/cedar/field/CedarField';
import { CedarElement } from '../../model/cedar/element/CedarElement';
import { CedarContainerAbstractArtifact } from '../../model/cedar/CedarAbstractContainerArtifact';

export abstract class JSONAbstractArtifactWriter extends AbstractArtifactWriter {
  protected getChildMapAsJSON(container: CedarContainerAbstractArtifact): JsonNode {
    const childMap: JsonNode = JsonNodeClass.getEmpty();

    container.children.forEach((child) => {
      const childName = child.schema_name;
      if (childName !== null) {
        const childMeta: CedarContainerChildInfo | null = container.childrenInfo.get(childName);
        if (childMeta !== null) {
          if (childMeta.multiInstance) {
            // TODO: handle maxItems, minItems inconsistencies
            const childNode: JsonNode = {
              [JsonSchema.type]: 'array',
              [CedarModel.minItems]: childMeta.minItems,
            };
            if (child instanceof CedarField) {
              childNode[JsonSchema.items] = this.writers.getJSONFieldWriterForType(child.cedarFieldType).getAsJsonNode(child, childMeta);
            } else if (child instanceof CedarElement) {
              childNode[JsonSchema.items] = this.writers.getJSONElementWriter().getAsJsonNode(child);
            }
            if (childMeta.maxItems !== null) {
              childNode[CedarModel.maxItems] = childMeta.maxItems;
            }
            childMap[childName] = childNode;
          } else {
            if (child instanceof CedarField) {
              childMap[childName] = this.writers.getJSONFieldWriterForType(child.cedarFieldType).getAsJsonNode(child, childMeta);
            } else if (child instanceof CedarElement) {
              childMap[childName] = this.writers.getJSONElementWriter().getAsJsonNode(child);
            }
          }
        }
      }
    });

    return childMap;
  }
}
