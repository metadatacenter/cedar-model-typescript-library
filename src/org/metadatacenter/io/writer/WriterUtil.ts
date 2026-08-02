import { TemplateChild } from '../../model/cedar/types/basic-types/TemplateChild';
import { ChildDeploymentInfoAlwaysMultiple } from '../../model/cedar/deployment/ChildDeploymentInfoAlwaysMultiple';
import { ChildDeploymentInfo } from '../../model/cedar/deployment/ChildDeploymentInfo';
import { AbstractChildDeploymentInfo } from '../../model/cedar/deployment/AbstractChildDeploymentInfo';

export abstract class WriterUtil {
  public static getMultiMinMax(
    child: TemplateChild,
    childMetaAbstract: AbstractChildDeploymentInfo,
  ): { isMultiInstance: boolean; minItems: number | null; maxItems: number | null } {
    let minItems: number | null = null;
    let maxItems: number | null = null;
    let isMultiInstance = false;
    if (child.isMultiInstanceByDefinition()) {
      // always multi-instance: Checkbox, Attribute-Value, MultipleChoiceList
      if (childMetaAbstract instanceof ChildDeploymentInfoAlwaysMultiple) {
        isMultiInstance = true;
        // The rule now lives on the deployment info, so a consumer reading the
        // parsed model and this writer cannot give different answers.
        minItems = childMetaAbstract.minItems;
        maxItems = childMetaAbstract.maxItems;
      }
    } else if (child.isSingleInstanceByDefinition()) {
      // always single instance: Radio
      isMultiInstance = false;
    } else {
      // regular deployment info
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
