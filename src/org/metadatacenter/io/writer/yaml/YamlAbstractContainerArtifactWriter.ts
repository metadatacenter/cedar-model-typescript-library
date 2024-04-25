import { AbstractContainerArtifact } from '../../../model/cedar/AbstractContainerArtifact';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { TemplateChild } from '../../../model/cedar/types/basic-types/TemplateChild';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { YamlAbstractArtifactWriter } from './YamlAbstractArtifactWriter';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { AbstractDynamicChildDeploymentInfo } from '../../../model/cedar/deployment/AbstractDynamicChildDeploymentInfo';
import { WriterUtil } from '../WriterUtil';
import { AbstractChildDeploymentInfo } from '../../../model/cedar/deployment/AbstractChildDeploymentInfo';

export abstract class YamlAbstractContainerArtifactWriter extends YamlAbstractArtifactWriter {
  protected getChildListAsJSON(container: AbstractContainerArtifact): JsonNode[] {
    const childList: JsonNode[] = JsonNode.getEmptyList();

    container
      .getChildrenInfo()
      .getChildrenNames()
      .forEach((childName: string) => {
        const child: TemplateChild | null = container.getChild(childName);
        if (child != null) {
          let childDefinition: JsonNode = JsonNode.getEmpty();
          const childMetaAbstract: AbstractChildDeploymentInfo | null = container.getChildrenInfo().get(childName);
          if (childMetaAbstract !== null) {
            // Put child deployment name
            childDefinition[YamlKeys.key] = childName;
            if (child instanceof TemplateField) {
              childDefinition = {
                ...childDefinition,
                ...this.writers.getFieldWriterForType(child.cedarFieldType).getYamlAsJsonNode(child, childMetaAbstract),
              };
            } else {
              childDefinition = {
                ...childDefinition,
                ...this.writers.getTemplateElementWriter().getYamlAsJsonNode(child),
              };
            }
            const deploymentInfo: JsonNode = this.getDeploymentInfo(child, childMetaAbstract);
            if (JsonNode.hasEntries(deploymentInfo)) {
              childDefinition[YamlKeys.configuration] = deploymentInfo;
            }
            childList.push(childDefinition);
          }
        }
      });

    return childList;
  }

  private getDeploymentInfo(child: TemplateChild | null, childMeta: AbstractChildDeploymentInfo): JsonNode {
    const childConfiguration: JsonNode = JsonNode.getEmpty();
    if (childMeta instanceof AbstractDynamicChildDeploymentInfo) {
      if (childMeta.requiredValue) {
        childConfiguration[YamlKeys.required] = true;
      }
      if (childMeta.hidden) {
        childConfiguration[YamlKeys.hidden] = true;
      }
      if (childMeta.recommendedValue) {
        childConfiguration[YamlKeys.recommended] = true;
      }
      if (childMeta.iri !== null) {
        childConfiguration[YamlKeys.propertyIri] = childMeta.iri;
      }
    }
    if (childMeta.label !== null && childMeta.label !== child?.schema_name) {
      childConfiguration[YamlKeys.overrideLabel] = childMeta.label;
    }
    if (childMeta.description !== null && childMeta.description !== child?.schema_description) {
      childConfiguration[YamlKeys.overrideDescription] = childMeta.description;
    }

    const { isMultiInstance, minItems: constMinItems, maxItems: constMaxItems } = WriterUtil.getMultiMinMax(child!, childMeta);
    let minItems = constMinItems;
    let maxItems = constMaxItems;

    if (isMultiInstance) {
      if (minItems === null) {
        minItems = 0;
      }
      if (maxItems !== null && maxItems < minItems) {
        maxItems = minItems;
      }
      if (child?.isMultiInstanceByDefinition() || child?.isSingleInstanceByDefinition()) {
        // Do not add multi info
      } else {
        childConfiguration[YamlKeys.multiple] = true;
        childConfiguration[YamlKeys.minItems] = minItems;
        if (maxItems !== null) {
          childConfiguration[YamlKeys.maxItems] = maxItems;
        }
      }
    }
    return childConfiguration;
  }
}
