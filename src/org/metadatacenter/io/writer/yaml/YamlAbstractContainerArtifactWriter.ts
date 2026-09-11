import { ChildDeploymentInfoAlwaysMultiple } from '../../../model/cedar/deployment/ChildDeploymentInfoAlwaysMultiple';
import { AbstractContainerArtifact } from '../../../model/cedar/AbstractContainerArtifact';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { TemplateChild } from '../../../model/cedar/types/basic-types/TemplateChild';
import { TemplateField } from '../../../model/cedar/field/TemplateField';
import { YamlAbstractArtifactWriter } from './YamlAbstractArtifactWriter';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { AbstractDynamicChildDeploymentInfo } from '../../../model/cedar/deployment/AbstractDynamicChildDeploymentInfo';
import { WriterUtil } from '../WriterUtil';
import { isSizedStaticField } from '../../../model/cedar/field/static/SizedStaticField';
import { AbstractChildDeploymentInfo } from '../../../model/cedar/deployment/AbstractChildDeploymentInfo';

export abstract class YamlAbstractContainerArtifactWriter extends YamlAbstractArtifactWriter {
  protected getChildListAsJSON(container: AbstractContainerArtifact, isCompact: boolean): JsonNode[] {
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
                ...this.writers.getFieldWriterForType(child.cedarFieldType).getYamlAsJsonNode(child, childMetaAbstract, isCompact, false),
              };
            } else {
              childDefinition = {
                ...childDefinition,
                ...this.writers.getTemplateElementWriter().getYamlAsJsonNode(child, isCompact, false),
              };
            }
            const deploymentInfo: JsonNode = this.getDeploymentInfo(child, childMetaAbstract, isCompact);
            if (JsonNode.hasEntries(deploymentInfo)) {
              childDefinition[YamlKeys.configuration] = deploymentInfo;
            }
            childList.push(childDefinition);
          }
        }
      });

    return childList;
  }

  private getDeploymentInfo(child: TemplateChild | null, childMeta: AbstractChildDeploymentInfo, isCompact: boolean): JsonNode {
    const childConfiguration: JsonNode = JsonNode.getEmpty();
    if (childMeta.hidden) childConfiguration[YamlKeys.hidden] = true;
    if (childMeta instanceof AbstractDynamicChildDeploymentInfo) {
      /*
       * Only where the field type has somewhere to keep it. An attribute-value
       * field records no requirement, and this block was the only place one could
       * exist: the JSON form has no constraints node for that type, so the same
       * template said the field was required in YAML and said nothing in JSON —
       * and JSON is the form that is stored and rendered from.
       *
       * `AbstractDynamicChildDeploymentInfoBuilder` declines such a requirement,
       * so a model assembled through a builder cannot reach here carrying one.
       * This guards the models that are not: `ChildDeploymentInfo` holds these as
       * public fields and the YAML reader sets them directly while assembling a
       * child, as may a caller.
       */
      const recordsRequirement = !(child instanceof TemplateField) || child.cedarFieldType.recordsRequirement;
      if (childMeta.requiredValue && recordsRequirement) {
        childConfiguration[YamlKeys.required] = true;
      }
      if (childMeta.recommendedValue && recordsRequirement) {
        childConfiguration[YamlKeys.recommended] = true;
      }
      if (childMeta.iri !== null) {
        if (!isCompact) {
          childConfiguration[YamlKeys.propertyIri] = childMeta.iri;
        }
      }
    }
    if (childMeta.label !== null && childMeta.label !== child?.schema_name) {
      childConfiguration[YamlKeys.overrideLabel] = childMeta.label;
    }
    if (childMeta.description !== null && childMeta.description !== child?.schema_description) {
      childConfiguration[YamlKeys.overrideDescription] = childMeta.description;
    }
    if (childMeta instanceof AbstractDynamicChildDeploymentInfo) {
      if (childMeta.continuePreviousLine) {
        childConfiguration[YamlKeys.continuePreviousLine] = true;
      }
      if (childMeta.valueRecommendationEnabled && child instanceof TemplateField && child.supportsValueRecommendation()) {
        childConfiguration[YamlKeys.valueRecommendation] = true;
      }
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
        // Multiplicity is implicit, but explicitly declared limits are not.
        if (childMeta instanceof ChildDeploymentInfoAlwaysMultiple) {
          if (childMeta.declaredMinItems !== null && childMeta.declaredMinItems !== childMeta.defaultMinItems)
            childConfiguration[YamlKeys.minItems] = minItems;
          if (childMeta.declaredMaxItems !== null) childConfiguration[YamlKeys.maxItems] = maxItems;
        }
      } else {
        childConfiguration[YamlKeys.multiple] = true;
        childConfiguration[YamlKeys.minItems] = minItems;
        if (maxItems !== null) {
          childConfiguration[YamlKeys.maxItems] = maxItems;
        }
      }
    }

    // A static field's display size is the parent's business, so it goes here rather than among the
    // field's own keys — where it sat, and where the specification puts it only for a field written
    // standalone, with no parent to hold it.
    if (isSizedStaticField(child)) {
      if (child.width !== null) {
        childConfiguration[YamlKeys.width] = child.width;
      }
      if (child.height !== null) {
        childConfiguration[YamlKeys.height] = child.height;
      }
    }
    return childConfiguration;
  }
}
