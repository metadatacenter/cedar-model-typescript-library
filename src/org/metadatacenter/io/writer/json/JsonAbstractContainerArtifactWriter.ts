import { JsonAbstractArtifactWriter } from './JsonAbstractArtifactWriter';
import { AbstractContainerArtifact } from '../../../model/cedar/AbstractContainerArtifact';
import { JsonContainerArtifactContent } from '../../../model/cedar/util/serialization/JsonContainerArtifactContent';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { TemplateChild } from '../../../model/cedar/types/basic-types/TemplateChild';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';

export abstract class JsonAbstractContainerArtifactWriter extends JsonAbstractArtifactWriter {
  protected macroContext(_artifact: AbstractContainerArtifact) {
    return JsonContainerArtifactContent.CONTEXT_VERBATIM;
  }

  protected getChildMapAsJson(container: AbstractContainerArtifact): JsonNode {
    const childMap: JsonNode = JsonNode.getEmpty();

    container
      .getChildrenInfo()
      .getChildrenNames()
      .forEach((childName: string) => {
        const child: TemplateChild | null = container.getChild(childName);
        if (child != null) {
          const childMeta: ChildDeploymentInfo | null = container.getChildrenInfo().get(childName);
          if (childMeta !== null) {
            let childDefinition: JsonNode;
            if (child instanceof TemplateField) {
              childDefinition = this.writers.getFieldWriterForType(child.cedarFieldType).getAsJsonNode(child, childMeta);
            } else {
              childDefinition = this.writers.getTemplateElementWriter().getAsJsonNode(child);
            }
            // If multi-instance, wrap the definition
            if (childMeta.multiInstance) {
              // TODO: handle maxItems, minItems inconsistencies
              childDefinition = {
                [JsonSchema.type]: 'array',
                [CedarModel.minItems]: childMeta.minItems,
                ...(childMeta.maxItems !== null && { [CedarModel.maxItems]: childMeta.maxItems }),
                [JsonSchema.items]: childDefinition,
              };
            }
            childMap[childName] = childDefinition;
          }
        }
      });

    return childMap;
  }
}
