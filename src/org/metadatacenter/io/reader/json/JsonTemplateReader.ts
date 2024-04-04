import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { TemplateProperty } from '../../../model/cedar/constants/TemplateProperty';
import { ReaderUtil } from '../ReaderUtil';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonTemplateContent } from '../../../model/cedar/util/serialization/JsonTemplateContent';
import { ObjectComparator } from '../../../model/cedar/util/compare/ObjectComparator';
import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { JsonTemplateReaderResult } from './JsonTemplateReaderResult';
import { ContainerArtifactChildrenInfo } from '../../../model/cedar/deployment/ContainerArtifactChildrenInfo';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { JsonReaderBehavior } from '../../../behavior/JsonReaderBehavior';
import { JsonTemplateFieldContentDynamic } from '../../../model/cedar/util/serialization/JsonTemplateFieldContentDynamic';
import { JsonTemplateElementReader } from './JsonTemplateElementReader';
import { JsonContainerArtifactReader } from './JsonContainerArtifactReader';
import { Template } from '../../../model/cedar/template/Template';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';

export class JsonTemplateReader extends JsonContainerArtifactReader {
  private readonly elementReader: JsonTemplateElementReader;
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.TEMPLATE;

  private constructor(behavior: JsonReaderBehavior) {
    super(behavior);
    this.elementReader = JsonTemplateElementReader.getForBehavior(behavior);
  }

  public static getStrict(): JsonTemplateReader {
    return new JsonTemplateReader(JsonReaderBehavior.STRICT);
  }

  public static getFebruary2024(): JsonTemplateReader {
    return new JsonTemplateReader(JsonReaderBehavior.FEBRUARY_2024);
  }

  public static getForBehavior(behavior: JsonReaderBehavior): JsonTemplateReader {
    return new JsonTemplateReader(behavior);
  }

  protected override getElementReader(): JsonTemplateElementReader {
    return this.elementReader;
  }

  protected override includeInIRIMapping(childInfo: ChildDeploymentInfo): boolean {
    return childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD;
  }

  public readFromString(templateSourceString: string): JsonTemplateReaderResult {
    let templateObject;
    try {
      templateObject = JSON.parse(templateSourceString);
    } catch (Exception) {
      templateObject = {};
    }
    return this.readFromObject(templateObject);
  }

  public readFromObject(templateSourceObject: JsonNode, topPath: JsonPath = new JsonPath()): JsonTemplateReaderResult {
    const parsingResult: ParsingResult = new ParsingResult();
    const template = Template.buildEmptyWithNullValues();

    this.readNonReportableAttributes(template, templateSourceObject);
    this.readReportableAttributes(template, templateSourceObject, parsingResult, topPath);
    this.readAnnotations(template, templateSourceObject, parsingResult, topPath);
    this.readInstanceTypeSpecification(template, templateSourceObject, parsingResult);
    this.readAndValidateChildrenInfo(template, templateSourceObject, parsingResult, topPath);

    return new JsonTemplateReaderResult(template, parsingResult, templateSourceObject);
  }

  protected readNonReportableAttributes(template: Template, templateSourceObject: JsonNode) {
    super.readNonReportableAttributes(template, templateSourceObject);
    // Read template-only properties
    const templateUI: JsonNode = ReaderUtil.getNode(templateSourceObject, CedarModel.ui);
    if (templateUI !== null) {
      template.header = ReaderUtil.getString(templateUI, CedarModel.header);
      template.footer = ReaderUtil.getString(templateUI, CedarModel.footer);
    }
  }

  private readInstanceTypeSpecification(template: Template, templateSourceObject: JsonNode, _parsingResult: ParsingResult) {
    const properties: JsonNode = ReaderUtil.getNode(templateSourceObject, JsonSchema.properties);
    if (properties !== null) {
      const atType: JsonNode = ReaderUtil.getNode(properties, JsonSchema.atType);
      if (atType !== null) {
        const oneOf: Array<JsonNode> = ReaderUtil.getNodeList(atType, JsonSchema.oneOf);
        if (oneOf !== null) {
          oneOf.forEach((item) => {
            const oneOfEnum = ReaderUtil.getStringList(item, JsonSchema.enum);
            if (oneOfEnum != null && oneOfEnum.length > 0) {
              template.instanceTypeSpecification = oneOfEnum[0];
            }
          });
        }
      }
    }
  }

  private readAndValidateChildrenInfo(template: Template, templateSourceObject: JsonNode, parsingResult: ParsingResult, path: JsonPath) {
    const templateRequired: Array<string> = ReaderUtil.getStringList(templateSourceObject, JsonSchema.required);
    const templateProperties: JsonNode = ReaderUtil.getNode(templateSourceObject, JsonSchema.properties);

    const templateRequiredMap: Map<string, boolean> = this.generateAndValidateRequiredMap(
      templateRequired,
      JsonTemplateContent.REQUIRED_PARTIAL,
      parsingResult,
      path,
    );

    const candidateChildrenInfo: ContainerArtifactChildrenInfo = this.getCandidateChildrenInfo(
      templateProperties,
      JsonTemplateContent.PROPERTIES_PARTIAL_KEY_MAP,
      parsingResult,
      path,
    );

    this.checkRequiredBothWays(
      candidateChildrenInfo,
      templateRequiredMap,
      templateRequired,
      JsonTemplateContent.REQUIRED_PARTIAL_KEY_MAP,
      parsingResult,
      path,
    );

    const templateUI: JsonNode = ReaderUtil.getNode(templateSourceObject, CedarModel.ui);
    this.extractUIPreferredLabelsAndDescriptions(templateUI, candidateChildrenInfo, parsingResult, path);

    this.extractIRIMappings(templateProperties, candidateChildrenInfo, parsingResult, path);

    const templateUIOrder = ReaderUtil.getStringList(templateUI, CedarModel.order);
    const finalChildrenInfo = this.finalizeChildInfo(templateUIOrder, candidateChildrenInfo, parsingResult, path);

    this.validatePropertiesVsOrder(candidateChildrenInfo, templateUIOrder, parsingResult, path);

    this.validateProperties(finalChildrenInfo, templateProperties, template, parsingResult, path);

    this.parseChildren(finalChildrenInfo, templateProperties, template, parsingResult, path);
  }

  private validateProperties(
    childrenInfo: ContainerArtifactChildrenInfo,
    templateProperties: JsonNode,
    _template: Template,
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
    let blueprint: JsonNode = JsonTemplateContent.PROPERTIES_PARTIAL;
    if (childrenInfo.hasAttributeValue()) {
      blueprint = ReaderUtil.deepClone(JsonTemplateContent.PROPERTIES_PARTIAL) as JsonNode;
      const atContext: JsonNode = blueprint[JsonSchema.atContext] as JsonNode;
      atContext[TemplateProperty.additionalProperties] =
        JsonTemplateFieldContentDynamic.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE_INSIDE;
    }
    ObjectComparator.compareToLeft(parsingResult, blueprint, templateProperties, path.add(JsonSchema.properties));
  }
}
