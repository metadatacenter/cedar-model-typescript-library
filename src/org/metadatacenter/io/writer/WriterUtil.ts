import { TemplateChild } from '../../model/cedar/types/basic-types/TemplateChild';
import { ChildDeploymentInfoAlwaysMultiple } from '../../model/cedar/deployment/ChildDeploymentInfoAlwaysMultiple';
import { AbstractDynamicChildDeploymentInfo } from '../../model/cedar/deployment/AbstractDynamicChildDeploymentInfo';
import { AbstractChildDeploymentInfo } from '../../model/cedar/deployment/AbstractChildDeploymentInfo';

export abstract class WriterUtil {
  private static readonly XSD_NAMESPACE = 'http://www.w3.org/2001/XMLSchema#';

  /**
   * A value's datatype as both writers spell it, which is how the Java library spells it in JSON. An IRI
   * in the XSD namespace with a local name is written as `xsd:` and that name, whether or not the library
   * knows the datatype. Any other IRI is written as it is. So is the namespace IRI itself, since it has
   * no local name and a bare `xsd:` is not an IRI.
   */
  public static writtenDatatype(type: string): string {
    return type.startsWith(WriterUtil.XSD_NAMESPACE) && type.length > WriterUtil.XSD_NAMESPACE.length
      ? 'xsd:' + type.substring(WriterUtil.XSD_NAMESPACE.length)
      : type;
  }

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
      // A field or an element whose cardinality the template states. Both answer through the
      // deployment info they share above, so asking it rather than one concrete class keeps the
      // answer the same for either.
      isMultiInstance = childMetaAbstract.isMultiInAnyWay();
      if (isMultiInstance && childMetaAbstract instanceof AbstractDynamicChildDeploymentInfo) {
        minItems = childMetaAbstract.minItems;
        maxItems = childMetaAbstract.maxItems;
      }
    }
    return { isMultiInstance, minItems, maxItems };
  }
}
