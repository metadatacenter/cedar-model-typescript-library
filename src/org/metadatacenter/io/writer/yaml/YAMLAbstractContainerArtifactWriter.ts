import { AbstractContainerArtifact } from '../../../model/cedar/AbstractContainerArtifact';
import { JsonNode, JsonNodeClass } from '../../../model/cedar/types/basic-types/JsonNode';
import { TemplateChild } from '../../../model/cedar/types/basic-types/TemplateChild';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { YAMLAbstractArtifactWriter } from './YAMLAbstractArtifactWriter';

export abstract class YAMLAbstractContainerArtifactWriter extends YAMLAbstractArtifactWriter {
  protected getChildListAsJSON(container: AbstractContainerArtifact): JsonNode[] {
    const childList: JsonNode[] = JsonNodeClass.getEmptyList();

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
              childDefinition = this.writers.getYAMLFieldWriterForType(child.cedarFieldType).getYamlAsJsonNode(child, childMeta);
            } else {
              childDefinition = this.writers.getJSONTemplateElementWriter().getAsJsonNode(child);
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
            childList.push(childDefinition);
          }
        }
      });

    return childList;
  }
}
