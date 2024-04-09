import { TemplateChild } from '../../model/cedar/types/basic-types/TemplateChild';
import { AbstractChildDeploymentInfo } from '../../model/cedar/deployment/AbstractChildDeploymentInfo';
import { ChildDeploymentInfoAlwaysMultiple } from '../../model/cedar/deployment/ChildDeploymentInfoAlwaysMultiple';
import { ChildDeploymentInfo } from '../../model/cedar/deployment/ChildDeploymentInfo';
import { AttributeValueFieldImpl } from '../../model/cedar/field/dynamic/attribute-value/AttributeValueFieldImpl';
import { ChildDeploymentInfoMultipleChoiceList } from '../../model/cedar/deployment/ChildDeploymentInfoMultipleChoiceList';

export abstract class WriterUtil {
  public static getMultiMinMax(
    child: TemplateChild,
    childMetaAbstract: AbstractChildDeploymentInfo,
  ): { isMultiInstance: boolean; minItems: number | null; maxItems: number | null } {
    let minItems: number | null = null;
    let maxItems: number | null = null;
    let isMultiInstance = false;
    if (child.isMultiInstanceByDefinition()) {
      if (
        childMetaAbstract instanceof ChildDeploymentInfoAlwaysMultiple ||
        childMetaAbstract instanceof ChildDeploymentInfoMultipleChoiceList
      ) {
        // const childMeta = childMetaAbstract as ChildDeploymentInfoAlwaysMultiple;
        // minItems = childMeta.minItems;
        isMultiInstance = true;
        if (child instanceof AttributeValueFieldImpl) {
          minItems = 0;
        } else {
          minItems = 1;
        }
      }
    } else if (child.isSingleInstanceByDefinition()) {
      isMultiInstance = false;
    } else {
      if (childMetaAbstract instanceof ChildDeploymentInfo) {
        const childMeta = childMetaAbstract as ChildDeploymentInfo;
        isMultiInstance = childMeta.multiInstance;
        if (isMultiInstance) {
          minItems = childMeta.minItems;
          maxItems = childMeta.maxItems;
        }
      }
    }
    return { isMultiInstance, minItems, maxItems };
  }
}
