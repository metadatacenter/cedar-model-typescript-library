import { CedarModel } from '../../model/cedar/constants/CedarModel';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { CedarArtifactType } from '../../model/cedar/types/beans/CedarArtifactType';
import { TemplateProperty } from '../../model/cedar/constants/TemplateProperty';
import { ReaderUtil } from './ReaderUtil';
import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { ObjectComparator } from '../../model/cedar/util/compare/ObjectComparator';
import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { CedarContainerChildrenInfo } from '../../model/cedar/types/beans/CedarContainerChildrenInfo';
import { CedarJsonPath } from '../../model/cedar/util/path/CedarJsonPath';
import { JSONReaderBehavior } from '../../behavior/JSONReaderBehavior';
import { UiInputType } from '../../model/cedar/types/beans/UiInputType';
import { CedarJSONTemplateFieldContentDynamic } from '../../model/cedar/util/serialization/CedarJSONTemplateFieldContentDynamic';
import { JSONElementReaderResult } from './JSONElementReaderResult';
import { CedarElement } from '../../model/cedar/element/CedarElement';
import { JSONContainerArtifactReader } from './JSONContainerArtifactReader';
import { CedarJSONElementContent } from '../../model/cedar/util/serialization/CedarJSONElementContent';
import { JSONElementWriter } from '../writer/JSONElementWriter';
import { CedarContainerChildInfo } from '../../model/cedar/types/beans/CedarContainerChildInfo';

export class JSONElementReader extends JSONContainerArtifactReader {
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.TEMPLATE_ELEMENT;

  private constructor(behavior: JSONReaderBehavior) {
    super(behavior);
  }

  public static getStrict(): JSONElementReader {
    return new JSONElementReader(JSONReaderBehavior.STRICT);
  }

  public static getFebruary2024(): JSONElementReader {
    return new JSONElementReader(JSONReaderBehavior.FEBRUARY_2024);
  }

  public static getForBehavior(behavior: JSONReaderBehavior): JSONElementReader {
    return new JSONElementReader(behavior);
  }

  protected override getElementReader(): JSONElementReader {
    return this;
  }
  protected override includeInIRIMapping(childInfo: CedarContainerChildInfo): boolean {
    return childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD && childInfo.uiInputType !== UiInputType.ATTRIBUTE_VALUE;
  }

  public readFromString(elementSourceString: string): JSONElementReaderResult {
    let elementObject;
    try {
      elementObject = JSON.parse(elementSourceString);
    } catch (Exception) {
      elementObject = {};
    }
    return this.readFromObject(elementObject);
  }

  public readFromObject(elementSourceObject: JsonNode, topPath: CedarJsonPath = new CedarJsonPath()): JSONElementReaderResult {
    const parsingResult: ParsingResult = new ParsingResult();
    const element = CedarElement.buildEmptyWithNullValues();

    this.readNonReportableAttributes(element, elementSourceObject);
    this.readReportableAttributes(element, elementSourceObject, parsingResult, topPath);
    this.readAndValidateChildrenInfo(element, elementSourceObject, parsingResult, topPath);

    return new JSONElementReaderResult(element, parsingResult, elementSourceObject);
  }

  protected readNonReportableAttributes(element: CedarElement, elementSourceObject: JsonNode) {
    super.readNonReportableAttributes(element, elementSourceObject);
  }

  private readAndValidateChildrenInfo(
    element: CedarElement,
    elementSourceObject: JsonNode,
    parsingResult: ParsingResult,
    path: CedarJsonPath,
  ) {
    const elementRequired: Array<string> = ReaderUtil.getStringList(elementSourceObject, JsonSchema.required);
    const elementProperties: JsonNode = ReaderUtil.getNode(elementSourceObject, JsonSchema.properties);

    const elementRequiredMap: Map<string, boolean> = this.generateAndValidateRequiredMap(
      elementRequired,
      CedarJSONElementContent.REQUIRED_PARTIAL,
      parsingResult,
      path,
    );

    const candidateChildrenInfo: CedarContainerChildrenInfo = this.getCandidateChildrenInfo(
      elementProperties,
      CedarJSONElementContent.PROPERTIES_PARTIAL_KEY_MAP,
      parsingResult,
      path,
    );

    this.checkRequiredBothWays(
      candidateChildrenInfo,
      elementRequiredMap,
      elementRequired,
      CedarJSONElementContent.REQUIRED_PARTIAL_KEY_MAP,
      parsingResult,
      path,
    );

    const elementUI: JsonNode = ReaderUtil.getNode(elementSourceObject, CedarModel.ui);
    this.extractUIPreferredLabelsAndDescriptions(elementUI, candidateChildrenInfo, parsingResult, path);

    this.extractIRIMappings(elementProperties, candidateChildrenInfo, parsingResult, path);

    const elementUIOrder = ReaderUtil.getStringList(elementUI, CedarModel.order);
    const finalChildrenInfo = this.finalizeChildInfo(elementUIOrder, candidateChildrenInfo, parsingResult, path);

    this.validatePropertiesVsOrder(candidateChildrenInfo, elementUIOrder, parsingResult, path);

    element.childrenInfo = finalChildrenInfo;

    this.validateProperties(elementProperties, element, parsingResult, path);

    this.parseChildren(finalChildrenInfo, elementProperties, element, parsingResult, path);
  }

  private validateProperties(elementProperties: JsonNode, element: CedarElement, parsingResult: ParsingResult, path: CedarJsonPath) {
    // Validate properties
    // 'properties' should have extra entry for Fields/Elements as definition
    // 'properties/context/properties' should have extra entry for Fields/Elements as IRI mappings
    // all other content should match verbatim
    // If there are attribute-value children, /properties/@context/additionalProperties/ must be
    //  {
    //    "type": "string",
    //    "format": "uri"
    //  },
    const blueprint = ReaderUtil.deepClone(CedarJSONElementContent.PROPERTIES_PARTIAL) as JsonNode;
    if (element.childrenInfo.hasAttributeValue()) {
      const atContext: JsonNode = blueprint[JsonSchema.atContext] as JsonNode;
      atContext[TemplateProperty.additionalProperties] =
        CedarJSONTemplateFieldContentDynamic.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE_INSIDE;
    }
    // Required should not be present if empty
    const atContext: JsonNode = blueprint[JsonSchema.atContext] as JsonNode;
    const pCRequired = ReaderUtil.getNodeList(atContext, JsonSchema.required);
    if (pCRequired != null && pCRequired.length == 0) {
      ReaderUtil.deleteNodeKey(atContext, JsonSchema.required);
    }
    ObjectComparator.compareToLeft(parsingResult, blueprint, elementProperties, path.add(JsonSchema.properties));
  }

  static getRoundTripComparisonResult(jsonElementReaderResult: JSONElementReaderResult, writer: JSONElementWriter): ParsingResult {
    const compareResult = new ParsingResult();
    ObjectComparator.compareBothWays(
      compareResult,
      jsonElementReaderResult.elementSourceObject,
      writer.getAsJsonNode(jsonElementReaderResult.element),
      new CedarJsonPath(),
    );
    return compareResult;
  }
}
