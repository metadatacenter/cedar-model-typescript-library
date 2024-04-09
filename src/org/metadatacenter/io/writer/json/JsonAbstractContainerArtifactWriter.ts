import { JsonAbstractArtifactWriter } from './JsonAbstractArtifactWriter';
import { AbstractContainerArtifact } from '../../../model/cedar/AbstractContainerArtifact';
import { JsonContainerArtifactContent } from '../../../model/cedar/util/serialization/JsonContainerArtifactContent';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { TemplateChild } from '../../../model/cedar/types/basic-types/TemplateChild';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { AbstractChildDeploymentInfo } from '../../../model/cedar/deployment/AbstractChildDeploymentInfo';
import { WriterUtil } from '../WriterUtil';

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
          let childDefinition: JsonNode = JsonNode.getEmpty();
          const childMetaAbstract: AbstractChildDeploymentInfo | null = container.getChildrenInfo().get(childName);
          if (childMetaAbstract !== null) {
            if (child instanceof TemplateField) {
              childDefinition = this.writers.getFieldWriterForType(child.cedarFieldType).getAsJsonNode(child, childMetaAbstract);
            } else {
              childDefinition = this.writers.getTemplateElementWriter().getAsJsonNode(child);
            }
          }
          if (childMetaAbstract !== null) {
            const {
              isMultiInstance,
              minItems: constMinItems,
              maxItems: constMaxItems,
            } = WriterUtil.getMultiMinMax(child, childMetaAbstract);
            let minItems = constMinItems;
            let maxItems = constMaxItems;
            // If multi-instance, wrap the definition
            if (isMultiInstance) {
              if (minItems === null) {
                minItems = 0;
              }
              if (maxItems !== null && maxItems < minItems) {
                maxItems = minItems;
              }
              const minMax = JsonNode.getEmpty();
              minMax[CedarModel.minItems] = minItems;
              if (maxItems !== null) {
                minMax[CedarModel.maxItems] = maxItems;
              }
              childDefinition = {
                [JsonSchema.type]: 'array',
                ...minMax,
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
