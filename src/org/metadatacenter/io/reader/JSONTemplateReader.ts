import { CedarSchema } from '../../model/cedar/types/beans/CedarSchema';
import { CedarModel } from '../../model/cedar/constants/CedarModel';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { CedarArtifactType } from '../../model/cedar/types/beans/CedarArtifactType';
import { JavascriptType } from '../../model/cedar/types/beans/JavascriptType';
import { TemplateProperty } from '../../model/cedar/constants/TemplateProperty';
import { ReaderUtil } from './ReaderUtil';
import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { CedarJSONTemplateContent } from '../../model/cedar/util/serialization/CedarJSONTemplateContent';
import { ObjectComparator } from '../../model/cedar/util/compare/ObjectComparator';
import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { JSONTemplateReaderResult } from './JSONTemplateReaderResult';
import { ComparisonError } from '../../model/cedar/util/compare/ComparisonError';
import { CedarContainerChildInfo } from '../../model/cedar/types/beans/CedarContainerChildInfo';
import { CedarContainerChildrenInfo } from '../../model/cedar/types/beans/CedarContainerChildrenInfo';
import { CedarJsonPath } from '../../model/cedar/util/path/CedarJsonPath';
import { ComparisonErrorType } from '../../model/cedar/util/compare/ComparisonErrorType';
import { JSONReaderBehavior } from '../../behavior/JSONReaderBehavior';
import { JSONTemplateWriter } from '../writer/JSONTemplateWriter';
import { UiInputType } from '../../model/cedar/types/beans/UiInputType';
import { CedarJSONTemplateFieldContentDynamic } from '../../model/cedar/util/serialization/CedarJSONTemplateFieldContentDynamic';
import { JSONElementReader } from './JSONElementReader';
import { JSONContainerArtifactReader } from './JSONContainerArtifactReader';
import { CedarTemplate } from '../../model/cedar/template/CedarTemplate';

export class JSONTemplateReader extends JSONContainerArtifactReader {
  private elementReader: JSONElementReader;

  private constructor(behavior: JSONReaderBehavior) {
    super(behavior);
    this.elementReader = JSONElementReader.getForBehavior(behavior);
  }

  public static getStrict(): JSONTemplateReader {
    return new JSONTemplateReader(JSONReaderBehavior.STRICT);
  }

  public static getFebruary2024(): JSONTemplateReader {
    return new JSONTemplateReader(JSONReaderBehavior.FEBRUARY_2024);
  }

  public static getForBehavior(behavior: JSONReaderBehavior): JSONTemplateReader {
    return new JSONTemplateReader(behavior);
  }

  public readFromString(templateSourceString: string): JSONTemplateReaderResult {
    let templateObject;
    try {
      templateObject = JSON.parse(templateSourceString);
    } catch (Exception) {
      templateObject = {};
    }
    return this.readFromObject(templateObject);
  }

  public readFromObject(templateSourceObject: JsonNode, topPath: CedarJsonPath = new CedarJsonPath()): JSONTemplateReaderResult {
    const parsingResult: ParsingResult = new ParsingResult();
    const template = CedarTemplate.buildEmptyWithNullValues();

    JSONTemplateReader.readNonReportableAttributes(template, templateSourceObject);
    JSONTemplateReader.readReportableAttributes(template, templateSourceObject, parsingResult, topPath);
    JSONTemplateReader.readInstanceTypeSpecification(template, templateSourceObject, parsingResult);
    this.readAndValidateChildrenInfo(template, templateSourceObject, parsingResult, topPath);

    return new JSONTemplateReaderResult(template, parsingResult, templateSourceObject);
  }

  protected static readNonReportableAttributes(template: CedarTemplate, templateSourceObject: JsonNode) {
    super.readNonReportableAttributes(template, templateSourceObject);
    // Read template-specific properties
    template.schema_identifier = ReaderUtil.getString(templateSourceObject, JsonSchema.schemaIdentifier);
    const templateUI: JsonNode = ReaderUtil.getNode(templateSourceObject, CedarModel.ui);
    if (templateUI !== null) {
      template.header = ReaderUtil.getString(templateUI, CedarModel.header);
      template.footer = ReaderUtil.getString(templateUI, CedarModel.footer);
    }
  }

  private static readReportableAttributes(
    template: CedarTemplate,
    templateSourceObject: JsonNode,
    parsingResult: ParsingResult,
    path: CedarJsonPath,
  ) {
    // Read and validate, but do not store top level @type
    ObjectComparator.comparePrimitive(
      parsingResult,
      CedarArtifactType.TEMPLATE.getValue(),
      ReaderUtil.getString(templateSourceObject, JsonSchema.atType),
      path.add(JsonSchema.atType),
    );

    // Read and validate, but do not store top level @context
    const topContextNode: JsonNode = ReaderUtil.getNode(templateSourceObject, JsonSchema.atContext);
    const blueprint = CedarJSONTemplateContent.CONTEXT_VERBATIM;
    ObjectComparator.compareBothWays(parsingResult, blueprint, topContextNode, path.add(JsonSchema.atContext));

    // Read and validate, but do not store top level type
    ObjectComparator.comparePrimitive(
      parsingResult,
      JavascriptType.OBJECT.getValue(),
      ReaderUtil.getString(templateSourceObject, CedarModel.type),
      path.add(CedarModel.type),
    );

    // Read and validate, but do not store top level additionalProperties
    // TODO: this is either false, or verbatim CedarJSONTemplateFieldContentStatic.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE
    // ObjectComparator.comparePrimitive(
    //   parsingResult,
    //   false,
    //   ReaderUtil.getBoolean(templateSourceObject, TemplateProperty.additionalProperties),
    //   path.add(TemplateProperty.additionalProperties),
    // );

    // Read and validate, but do not store top level $schema
    ObjectComparator.comparePrimitive(
      parsingResult,
      CedarSchema.CURRENT.getValue(),
      ReaderUtil.getString(templateSourceObject, CedarModel.schema),
      path.add(CedarModel.schema),
    );
  }

  private static readInstanceTypeSpecification(template: CedarTemplate, templateSourceObject: JsonNode, parsingResult: ParsingResult) {
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

  private readAndValidateChildrenInfo(
    template: CedarTemplate,
    templateSourceObject: JsonNode,
    parsingResult: ParsingResult,
    path: CedarJsonPath,
  ) {
    const templateRequired: Array<string> = ReaderUtil.getStringList(templateSourceObject, JsonSchema.required);
    const templateProperties: JsonNode = ReaderUtil.getNode(templateSourceObject, JsonSchema.properties);

    // Generate a map of the "required" list for caching reasons
    const templateRequiredMap: Map<string, boolean> = templateRequired.reduce((acc, current) => {
      acc.set(current, true);
      return acc;
    }, new Map<string, boolean>());

    // Check if all the keys of the "required" blueprint are present in the template's "required"
    for (const key of CedarJSONTemplateContent.REQUIRED_PARTIAL) {
      if (!templateRequiredMap.has(key)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError('jtr01', ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, path.add(JsonSchema.required), key),
        );
      }
    }

    // Generate the candidate children names list based on the unknown keys of "properties"
    const candidateChildrenInfo: CedarContainerChildrenInfo = new CedarContainerChildrenInfo();
    Object.keys(templateProperties).forEach((key) => {
      if (!CedarJSONTemplateContent.PROPERTIES_PARTIAL_KEY_MAP.has(key)) {
        const propertiesChildNode: JsonNode = ReaderUtil.getNode(templateProperties, key);

        if (typeof propertiesChildNode === 'object' && propertiesChildNode !== null) {
          let childDefinitionNode = propertiesChildNode;
          const typeOfItems = ReaderUtil.getString(propertiesChildNode, JsonSchema.type);
          if (typeOfItems == 'object') {
            // Single instance, parse forward
            this.readAndStoreCandidateChildInfo(
              childDefinitionNode,
              key,
              parsingResult,
              candidateChildrenInfo,
              path.add(JsonSchema.properties, key),
            );
          } else if (typeOfItems == 'array') {
            // Multiple instance, parse multi-info, then process 'items'
            childDefinitionNode = ReaderUtil.getNode(propertiesChildNode, JsonSchema.items);
            const childInfo: CedarContainerChildInfo | null = this.readAndStoreCandidateChildInfo(
              childDefinitionNode,
              key,
              parsingResult,
              candidateChildrenInfo,
              path.add(JsonSchema.properties, key, JsonSchema.items),
            );
            if (childInfo !== null) {
              // TODO: elevate this parsing to a separate class
              // Also handle maxItems inconsistencies.
              childInfo.multiInstance = true;
              childInfo.minItems = ReaderUtil.getNumber(propertiesChildNode, CedarModel.minItems);
              childInfo.maxItems = ReaderUtil.getNumber(propertiesChildNode, CedarModel.maxItems);
            }
          }
        }
      }
    });

    // Check if all candidate children are present in the "required". Static fields don't need to be there
    const childNames: Array<string> = candidateChildrenInfo.getChildrenNamesForRequired();
    for (const childName of childNames) {
      if (!templateRequiredMap.has(childName)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError('jtr02', ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, path.add(JsonSchema.required), childName),
        );
      }
    }

    // Check if "required" contains extra nodes (not in blueprint, not in children name list)
    for (const key of templateRequired) {
      if (!CedarJSONTemplateContent.REQUIRED_PARTIAL_KEY_MAP.has(key) && !candidateChildrenInfo.has(key)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError('jtr03', ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT, path.add(JsonSchema.required), key),
        );
      }
    }

    // Extract _ui/propertyLabels
    const templateUI: JsonNode = ReaderUtil.getNode(templateSourceObject, CedarModel.ui);
    const templateUIPLabels = ReaderUtil.getStringMap(templateUI, CedarModel.propertyLabels);
    for (const childInfo of candidateChildrenInfo.children) {
      if (templateUIPLabels === null || !templateUIPLabels.has(childInfo.name)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError(
            'jtr04',
            ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
            path.add(CedarModel.ui, CedarModel.propertyLabels),
            childInfo.name,
          ),
        );
      } else {
        childInfo.label = templateUIPLabels.get(childInfo.name) ?? null;
      }
    }

    // Extract _ui/propertyDescriptions
    const templateUIPDescriptions = ReaderUtil.getStringMap(templateUI, CedarModel.propertyDescriptions);
    for (const childInfo of candidateChildrenInfo.children) {
      if (templateUIPDescriptions === null || !templateUIPDescriptions.has(childInfo.name)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError(
            'jtr05',
            ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
            path.add(CedarModel.ui, CedarModel.propertyDescriptions),
            childInfo.name,
          ),
        );
      } else {
        childInfo.description = templateUIPDescriptions.get(childInfo.name) ?? null;
      }
    }

    // Get the IRI mappings
    const templatePropertiesContext: JsonNode = ReaderUtil.getNode(templateProperties, JsonSchema.atContext);
    const templateIRIMap: JsonNode = ReaderUtil.getNode(templatePropertiesContext, JsonSchema.properties);
    for (const childInfo of candidateChildrenInfo.children) {
      if (childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD) {
        const iriEnum: JsonNode = ReaderUtil.getNode(templateIRIMap, childInfo.name);
        const iriList: Array<string> = ReaderUtil.getStringList(iriEnum, JsonSchema.enum);
        if (iriList === null || iriList.length != 1) {
          parsingResult.addBlueprintComparisonError(
            new ComparisonError(
              'jtr06',
              ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
              path.add(JsonSchema.properties, JsonSchema.atContext, JsonSchema.properties, childInfo.name, JsonSchema.enum, 0),
            ),
          );
        } else {
          childInfo.iri = iriList[0];
        }
      }
    }

    // Generate final child info, based on the order and content of _ui/order. Disregard candidates not present in _ui/order with an error
    const templateUIOrder = ReaderUtil.getStringList(templateUI, CedarModel.order);
    const finalChildrenInfo = new CedarContainerChildrenInfo();
    for (const key of templateUIOrder) {
      const candidate = candidateChildrenInfo.get(key);
      if (candidate !== null && candidate !== undefined) {
        finalChildrenInfo.add(candidate);
      } else {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError(
            'jtr07',
            ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
            path.add(CedarModel.ui, CedarModel.order),
            null,
            key,
          ),
        );
      }
    }

    // Children present in the 'properties' but not in the 'order' will also result in error
    for (const childInfo of candidateChildrenInfo.children) {
      if (!templateUIOrder.includes(childInfo.name)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError(
            'jtr08',
            ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
            path.add(CedarModel.ui, CedarModel.order),
            childInfo.name,
            null,
          ),
        );
      }
    }
    template.childrenInfo = finalChildrenInfo;

    // Validate properties
    // 'properties' should have extra entry for Fields/Elements as definition
    // 'properties/context/properties' should have extra entry for Fields/Elements as IRI mappings
    // all other content should match verbatim
    // If there are attribute-value children, /properties/@context/additionalProperties/ must be
    //  {
    //    "type": "string",
    //    "format": "uri"
    //  },
    let blueprint: JsonNode = CedarJSONTemplateContent.PROPERTIES_PARTIAL;
    if (template.childrenInfo.hasAttributeValue()) {
      blueprint = ReaderUtil.deepClone(CedarJSONTemplateContent.PROPERTIES_PARTIAL) as JsonNode;
      const atContext: JsonNode = blueprint[JsonSchema.atContext] as JsonNode;
      atContext[TemplateProperty.additionalProperties] =
        CedarJSONTemplateFieldContentDynamic.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE_INSIDE;
    }
    ObjectComparator.compareToLeft(parsingResult, blueprint, templateProperties, path.add(JsonSchema.properties));

    // Parse children
    // TODO: handle elements, generalize this code, since it will be used in templates and elements as well
    for (const childInfo of finalChildrenInfo.children) {
      let childDefinition: JsonNode = ReaderUtil.getNode(templateProperties, childInfo.name);
      let childPath: CedarJsonPath = path.add(JsonSchema.properties, childInfo.name);
      if (childInfo.multiInstance) {
        childDefinition = ReaderUtil.getNode(childDefinition, JsonSchema.items);
        childPath = childPath.add(JsonSchema.items);
      }
      if (childInfo.atType === CedarArtifactType.TEMPLATE_FIELD || childInfo.atType === CedarArtifactType.STATIC_TEMPLATE_FIELD) {
        const cedarFieldReaderResult = this.fieldReader.readFromObject(childDefinition, childPath);
        template.addChild(cedarFieldReaderResult.field);
        parsingResult.merge(cedarFieldReaderResult.parsingResult);
      } else if (childInfo.atType === CedarArtifactType.TEMPLATE_ELEMENT) {
        const cedarElementReaderResult = this.elementReader.readFromObject(childDefinition, childPath);
        template.addChild(cedarElementReaderResult.element);
        parsingResult.merge(cedarElementReaderResult.parsingResult);
      }
    }
  }

  static getRoundTripComparisonResult(jsonTemplateReaderResult: JSONTemplateReaderResult, writer: JSONTemplateWriter): ParsingResult {
    const compareResult = new ParsingResult();
    ObjectComparator.compareBothWays(
      compareResult,
      jsonTemplateReaderResult.templateSourceObject,
      writer.getAsJsonNode(jsonTemplateReaderResult.template),
      new CedarJsonPath(),
    );
    return compareResult;
  }

  private readAndStoreCandidateChildInfo(
    childDefinitionNode: JsonNode,
    childCandidateName: string,
    parsingResult: ParsingResult,
    candidateChildrenInfo: CedarContainerChildrenInfo,
    path: CedarJsonPath,
  ): CedarContainerChildInfo | null {
    const atType: CedarArtifactType = CedarArtifactType.forValue(ReaderUtil.getString(childDefinitionNode, JsonSchema.atType));
    if (atType !== CedarArtifactType.NULL) {
      const childInfo: CedarContainerChildInfo = new CedarContainerChildInfo(childCandidateName);
      childInfo.atType = atType;
      const uiNode: JsonNode = ReaderUtil.getNode(childDefinitionNode, CedarModel.ui);
      childInfo.uiInputType = UiInputType.forValue(ReaderUtil.getString(uiNode, CedarModel.inputType));
      candidateChildrenInfo.add(childInfo);
      return childInfo;
    } else {
      parsingResult.addBlueprintComparisonError(
        new ComparisonError('jtr09', ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, path.add(childCandidateName, JsonSchema.atType)),
      );
      return null;
    }
  }
}
