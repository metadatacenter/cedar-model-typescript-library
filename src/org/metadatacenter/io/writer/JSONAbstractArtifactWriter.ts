import { AbstractArtifactWriter } from './AbstractArtifactWriter';
import { JsonNode, JsonNodeClass } from '../../model/cedar/types/basic-types/JsonNode';
import { ChildDeploymentInfo } from '../../model/cedar/deployment/ChildDeploymentInfo';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { CedarModel } from '../../model/cedar/constants/CedarModel';
import { TemplateField } from '../../model/cedar/field/TemplateField';
import { TemplateElement } from '../../model/cedar/element/TemplateElement';
import { AbstractContainerArtifact } from '../../model/cedar/AbstractContainerArtifact';
import { TemplateChild } from '../../model/cedar/types/basic-types/TemplateChild';

export abstract class JSONAbstractArtifactWriter extends AbstractArtifactWriter {
  protected getChildMapAsJSON(container: AbstractContainerArtifact): JsonNode {
    const childMap: JsonNode = JsonNodeClass.getEmpty();

    container.children.forEach((child: TemplateChild) => {
      const childName = child.schema_name;
      if (childName !== null) {
        const childMeta: ChildDeploymentInfo | null = container.childrenInfo.get(childName);
        if (childMeta !== null) {
          if (childMeta.multiInstance) {
            // TODO: handle maxItems, minItems inconsistencies
            const childNode: JsonNode = {
              [JsonSchema.type]: 'array',
              [CedarModel.minItems]: childMeta.minItems,
            };
            if (child instanceof TemplateField) {
              childNode[JsonSchema.items] = this.writers.getJSONFieldWriterForType(child.cedarFieldType).getAsJsonNode(child, childMeta);
            } else if (child instanceof TemplateElement) {
              childNode[JsonSchema.items] = this.writers.getJSONElementWriter().getAsJsonNode(child);
            }
            if (childMeta.maxItems !== null) {
              childNode[CedarModel.maxItems] = childMeta.maxItems;
            }
            childMap[childName] = childNode;
          } else {
            if (child instanceof TemplateField) {
              childMap[childName] = this.writers.getJSONFieldWriterForType(child.cedarFieldType).getAsJsonNode(child, childMeta);
            } else if (child instanceof TemplateElement) {
              childMap[childName] = this.writers.getJSONElementWriter().getAsJsonNode(child);
            }
          }
        }
      }
    });

    return childMap;
  }
}
