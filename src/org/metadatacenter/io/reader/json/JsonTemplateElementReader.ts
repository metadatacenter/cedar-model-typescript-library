import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { TemplateProperty } from '../../../model/cedar/constants/TemplateProperty';
import { ReaderUtil } from '../ReaderUtil';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonObjectComparator } from '../../../model/cedar/util/compare/JsonObjectComparator';
import { JsonArtifactParsingResult } from '../../../model/cedar/util/compare/JsonArtifactParsingResult';
import { ContainerArtifactChildrenInfo } from '../../../model/cedar/deployment/ContainerArtifactChildrenInfo';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { JsonReaderBehavior } from '../../../behavior/JsonReaderBehavior';
import { JsonTemplateFieldContentDynamic } from '../../../model/cedar/util/serialization/JsonTemplateFieldContentDynamic';
import { JsonTemplateElementReaderResult } from './JsonTemplateElementReaderResult';
import { TemplateElement } from '../../../model/cedar/element/TemplateElement';
import { JsonContainerArtifactReader } from './JsonContainerArtifactReader';
import { JsonTemplateElementContent } from '../../../model/cedar/util/serialization/JsonTemplateElementContent';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { AbstractChildDeploymentInfo } from '../../../model/cedar/deployment/AbstractChildDeploymentInfo';
import { UiInputType } from '../../../model/cedar/types/wrapped-types/UiInputType';

export class JsonTemplateElementReader extends JsonContainerArtifactReader {
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.TEMPLATE_ELEMENT;

  private constructor(behavior: JsonReaderBehavior) {
    super(behavior);
  }

  public static getStrict(): JsonTemplateElementReader {
    return new JsonTemplateElementReader(JsonReaderBehavior.STRICT);
  }

  public static getFebruary2024(): JsonTemplateElementReader {
    return new JsonTemplateElementReader(JsonReaderBehavior.FEBRUARY_2024);
  }

  public static getForBehavior(behavior: JsonReaderBehavior): JsonTemplateElementReader {
    return new JsonTemplateElementReader(behavior);
  }

  protected override getElementReader(): JsonTemplateElementReader {
    return this;
  }

  protected override includeInIRIMapping(childInfo: ChildDeploymentInfo): boolean {
    return childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public readFromString(elementSourceString: string): JsonTemplateElementReaderResult {
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
    _childInfo: AbstractChildDeploymentInfo,
    topPath: JsonPath,
  ): JsonTemplateElementReaderResult {
    const parsingResult: JsonArtifactParsingResult = new JsonArtifactParsingResult();
    const element = TemplateElement.buildEmptyWithNullValues();

    this.readNonReportableAttributes(element, elementSourceObject);
    this.readReportableAttributes(element, elementSourceObject, parsingResult, topPath);
    this.readAnnotations(element, elementSourceObject, parsingResult, topPath);
    this.readInstanceTypeSpecification(element, elementSourceObject, parsingResult);
    this.readAndValidateChildrenInfo(element, elementSourceObject, parsingResult, topPath);

    return new JsonTemplateElementReaderResult(element, parsingResult, elementSourceObject);
  }

  protected readNonReportableAttributes(element: TemplateElement, elementSourceObject: JsonNode) {
    element.skos_prefLabel = ReaderUtil.getString(elementSourceObject, CedarModel.skosPrefLabel);
    element.skos_altLabel = ReaderUtil.getFilteredStringList(elementSourceObject, CedarModel.skosAltLabel);
    super.readNonReportableAttributes(element, elementSourceObject);
  }

  private readAndValidateChildrenInfo(
    element: TemplateElement,
    elementSourceObject: JsonNode,
    parsingResult: JsonArtifactParsingResult,
    path: JsonPath,
  ) {
    const elementRequired: Array<string> = ReaderUtil.getStringList(elementSourceObject, JsonSchema.required);
    const elementProperties: JsonNode = ReaderUtil.getNode(elementSourceObject, JsonSchema.properties);

    const elementRequiredMap: Map<string, boolean> = this.generateAndValidateRequiredMap(
      elementRequired,
      JsonTemplateElementContent.REQUIRED_PARTIAL,
      parsingResult,
      path,
    );

    const candidateChildrenInfo: ContainerArtifactChildrenInfo = this.getCandidateChildrenInfo(
      elementProperties,
      JsonTemplateElementContent.PROPERTIES_PARTIAL_KEY_MAP,
      parsingResult,
      path,
    );

    this.checkRequiredBothWays(
      candidateChildrenInfo,
      elementRequiredMap,
      elementRequired,
      JsonTemplateElementContent.REQUIRED_PARTIAL_KEY_MAP,
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
    parsingResult: JsonArtifactParsingResult,
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
    const blueprint = ReaderUtil.deepClone(JsonTemplateElementContent.PROPERTIES_PARTIAL) as JsonNode;
    if (childrenInfo.hasAttributeValue()) {
      const atContext: JsonNode = blueprint[JsonSchema.atContext] as JsonNode;
      atContext[TemplateProperty.additionalProperties] =
        JsonTemplateFieldContentDynamic.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE_INSIDE;
    }
    // Required should not be present if empty
    const atContext: JsonNode = blueprint[JsonSchema.atContext] as JsonNode;
    const pCRequired = ReaderUtil.getNodeList(atContext, JsonSchema.required);
    if (pCRequired != null && pCRequired.length == 0) {
      ReaderUtil.deleteNodeKey(atContext, JsonSchema.required);
    }
    JsonObjectComparator.compareToLeft(parsingResult, blueprint, elementProperties, path.add(JsonSchema.properties));
  }
}
