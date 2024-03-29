import { AbstractContainerArtifact } from '../../../model/cedar/AbstractContainerArtifact';
import { JsonNode, JsonNodeClass } from '../../../model/cedar/types/basic-types/JsonNode';
import { TemplateChild } from '../../../model/cedar/types/basic-types/TemplateChild';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { YAMLAbstractArtifactWriter } from './YAMLAbstractArtifactWriter';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { UiInputType } from '../../../model/cedar/types/wrapped-types/UiInputType';

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
            let childDefinition: JsonNode = JsonNodeClass.getEmpty();
            // Put child deployment name
            childDefinition[YamlKeys.key] = childName;
            // If multi-instance, add info
            if (
              childMeta.multiInstance &&
              childMeta.uiInputType != UiInputType.CHECKBOX &&
              childMeta.uiInputType != UiInputType.LIST &&
              childMeta.uiInputType != UiInputType.ATTRIBUTE_VALUE
            ) {
              // TODO: handle maxItems, minItems inconsistencies
              childDefinition[YamlKeys.multiple] = true;
              childDefinition[YamlKeys.minItems] = childMeta.minItems;
              if (childMeta.maxItems !== null) {
                childDefinition[YamlKeys.maxItems] = childMeta.maxItems;
              }
            }
            if (child instanceof TemplateField) {
              childDefinition = {
                ...childDefinition,
                ...this.writers.getYAMLFieldWriterForType(child.cedarFieldType).getYamlAsJsonNode(child, childMeta),
              };
            } else {
              childDefinition = {
                ...childDefinition,
                ...this.writers.getYAMLTemplateElementWriter().getYamlAsJsonNode(child),
              };
            }
            childList.push(childDefinition);
          }
        }
      });

    return childList;
  }
}
