import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { TemplateProperty } from '../../../model/cedar/constants/TemplateProperty';
import { ReaderUtil } from '../ReaderUtil';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { ObjectComparator } from '../../../model/cedar/util/compare/ObjectComparator';
import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { ContainerArtifactChildrenInfo } from '../../../model/cedar/deployment/ContainerArtifactChildrenInfo';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { JSONReaderBehavior } from '../../../behavior/JSONReaderBehavior';
import { UiInputType } from '../../../model/cedar/types/wrapped-types/UiInputType';
import { JSONTemplateFieldContentDynamic } from '../../../model/cedar/util/serialization/JSONTemplateFieldContentDynamic';
import { JSONTemplateElementReaderResult } from './JSONTemplateElementReaderResult';
import { TemplateElement } from '../../../model/cedar/element/TemplateElement';
import { JSONContainerArtifactReader } from './JSONContainerArtifactReader';
import { JSONTemplateElementContent } from '../../../model/cedar/util/serialization/JSONTemplateElementContent';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';

export class JSONTemplateElementReader extends JSONContainerArtifactReader {
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.TEMPLATE_ELEMENT;

  private constructor(behavior: JSONReaderBehavior) {
    super(behavior);
  }

  public static getStrict(): JSONTemplateElementReader {
    return new JSONTemplateElementReader(JSONReaderBehavior.STRICT);
  }

  public static getFebruary2024(): JSONTemplateElementReader {
    return new JSONTemplateElementReader(JSONReaderBehavior.FEBRUARY_2024);
  }

  public static getForBehavior(behavior: JSONReaderBehavior): JSONTemplateElementReader {
    return new JSONTemplateElementReader(behavior);
  }

  protected override getElementReader(): JSONTemplateElementReader {
    return this;
  }

  protected override includeInIRIMapping(childInfo: ChildDeploymentInfo): boolean {
    return childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD && childInfo.uiInputType !== UiInputType.ATTRIBUTE_VALUE;
  }

  public readFromString(elementSourceString: string): JSONTemplateElementReaderResult {
    let elementObject;
    try {
      elementObject = JSON.parse(elementSourceString);
    } catch (Exception) {
      elementObject = {};
    }
    return this.readFromObject(elementObject, ChildDeploymentInfo.empty(), new JsonPath());
  }

  public readFromObject(
    elementSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    topPath: JsonPath,
  ): JSONTemplateElementReaderResult {
    const parsingResult: ParsingResult = new ParsingResult();
    const element = TemplateElement.buildEmptyWithNullValues();

    this.readNonReportableAttributes(element, elementSourceObject);
    this.readReportableAttributes(element, elementSourceObject, parsingResult, topPath);
    this.readAnnotations(element, elementSourceObject, parsingResult, topPath);
    this.readAndValidateChildrenInfo(element, elementSourceObject, parsingResult, topPath);

    return new JSONTemplateElementReaderResult(element, parsingResult, elementSourceObject);
  }

  protected readNonReportableAttributes(element: TemplateElement, elementSourceObject: JsonNode) {
    super.readNonReportableAttributes(element, elementSourceObject);
  }

  private readAndValidateChildrenInfo(
    element: TemplateElement,
    elementSourceObject: JsonNode,
    parsingResult: ParsingResult,
    path: JsonPath,
  ) {
    const elementRequired: Array<string> = ReaderUtil.getStringList(elementSourceObject, JsonSchema.required);
    const elementProperties: JsonNode = ReaderUtil.getNode(elementSourceObject, JsonSchema.properties);

    const elementRequiredMap: Map<string, boolean> = this.generateAndValidateRequiredMap(
      elementRequired,
      JSONTemplateElementContent.REQUIRED_PARTIAL,
      parsingResult,
      path,
    );

    const candidateChildrenInfo: ContainerArtifactChildrenInfo = this.getCandidateChildrenInfo(
      elementProperties,
      JSONTemplateElementContent.PROPERTIES_PARTIAL_KEY_MAP,
      parsingResult,
      path,
    );

    this.checkRequiredBothWays(
      candidateChildrenInfo,
      elementRequiredMap,
      elementRequired,
      JSONTemplateElementContent.REQUIRED_PARTIAL_KEY_MAP,
      parsingResult,
      path,
    );

    const elementUI: JsonNode = ReaderUtil.getNode(elementSourceObject, CedarModel.ui);
    this.extractUIPreferredLabelsAndDescriptions(elementUI, candidateChildrenInfo, parsingResult, path);

    this.extractIRIMappings(elementProperties, candidateChildrenInfo, parsingResult, path);

    const elementUIOrder = ReaderUtil.getStringList(elementUI, CedarModel.order);
    const finalChildrenInfo = this.finalizeChildInfo(elementUIOrder, candidateChildrenInfo, parsingResult, path);

    this.validatePropertiesVsOrder(candidateChildrenInfo, elementUIOrder, parsingResult, path);

    this.validateProperties(finalChildrenInfo, elementProperties, element, parsingResult, path);

    this.parseChildren(finalChildrenInfo, elementProperties, element, parsingResult, path);
  }

  private validateProperties(
    childrenInfo: ContainerArtifactChildrenInfo,
    elementProperties: JsonNode,
    _element: TemplateElement,
    parsingResult: ParsingResult,
    path: JsonPath,
  ) {
    // Validate properties
    // 'properties' should have extra entry for Fields/Elements as definition
    // 'properties/context/properties' should have extra entry for Fields/Elements as IRI mappings
    // all other content should match verbatim
    // If there are attribute-value children, /properties/@context/additionalProperties/ must be
    //  {
    //    "type": "string",
    //    "format": "uri"
    //  },
    const blueprint = ReaderUtil.deepClone(JSONTemplateElementContent.PROPERTIES_PARTIAL) as JsonNode;
    if (childrenInfo.hasAttributeValue()) {
      const atContext: JsonNode = blueprint[JsonSchema.atContext] as JsonNode;
      atContext[TemplateProperty.additionalProperties] =
        JSONTemplateFieldContentDynamic.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE_INSIDE;
    }
    // Required should not be present if empty
    const atContext: JsonNode = blueprint[JsonSchema.atContext] as JsonNode;
    const pCRequired = ReaderUtil.getNodeList(atContext, JsonSchema.required);
    if (pCRequired != null && pCRequired.length == 0) {
      ReaderUtil.deleteNodeKey(atContext, JsonSchema.required);
    }
    ObjectComparator.compareToLeft(parsingResult, blueprint, elementProperties, path.add(JsonSchema.properties));
  }
}
