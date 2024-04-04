import { AbstractContainerArtifact } from '../../../model/cedar/AbstractContainerArtifact';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { TemplateChild } from '../../../model/cedar/types/basic-types/TemplateChild';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { YamlAbstractArtifactWriter } from './YamlAbstractArtifactWriter';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { UiInputType } from '../../../model/cedar/types/wrapped-types/UiInputType';

export abstract class YamlAbstractContainerArtifactWriter extends YamlAbstractArtifactWriter {
  protected getChildListAsJSON(container: AbstractContainerArtifact): JsonNode[] {
    const childList: JsonNode[] = JsonNode.getEmptyList();

    container
      .getChildrenInfo()
      .getChildrenNames()
      .forEach((childName: string) => {
        const child: TemplateChild | null = container.getChild(childName);
        if (child != null) {
          const childMeta: ChildDeploymentInfo | null = container.getChildrenInfo().get(childName);
          if (childMeta !== null) {
            let childDefinition: JsonNode = JsonNode.getEmpty();
            // Put child deployment name
            childDefinition[YamlKeys.name] = childName;

            if (child instanceof TemplateField) {
              childDefinition = {
                ...childDefinition,
                ...this.writers.getFieldWriterForType(child.cedarFieldType).getYamlAsJsonNode(child, childMeta),
              };
            } else {
              childDefinition = {
                ...childDefinition,
                ...this.writers.getTemplateElementWriter().getYamlAsJsonNode(child),
              };
            }
            childDefinition[YamlKeys.configuration] = this.getDeploymentInfo(childMeta);
            childList.push(childDefinition);
          }
        }
      });

    return childList;
  }

  private getDeploymentInfo(childMeta: ChildDeploymentInfo): JsonNode {
    const childConfiguration: JsonNode = JsonNode.getEmpty();
    if (childMeta.requiredValue) {
      childConfiguration[YamlKeys.required] = true;
    }
    if (childMeta.hidden) {
      childConfiguration[YamlKeys.hidden] = true;
    }
    if (childMeta.uiInputType != UiInputType.ATTRIBUTE_VALUE) {
      childConfiguration[YamlKeys.propertyIRI] = childMeta.iri;
    }
    childConfiguration[YamlKeys.overrideLabel] = childMeta.label;
    childConfiguration[YamlKeys.overrideDescription] = childMeta.description;
    // If multi-instance, add info
    if (
      childMeta.multiInstance &&
      childMeta.uiInputType != UiInputType.CHECKBOX &&
      childMeta.uiInputType != UiInputType.LIST &&
      childMeta.uiInputType != UiInputType.ATTRIBUTE_VALUE
    ) {
      // TODO: handle maxItems, minItems inconsistencies
      childConfiguration[YamlKeys.multiple] = true;
      childConfiguration[YamlKeys.minItems] = childMeta.minItems;
      if (childMeta.maxItems !== null) {
        childConfiguration[YamlKeys.maxItems] = childMeta.maxItems;
      }
    }
    return childConfiguration;
  }
}
