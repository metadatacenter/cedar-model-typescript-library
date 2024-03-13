import { CedarSchema } from '../../model/cedar/types/beans/CedarSchema';
import { CedarModel } from '../../model/cedar/constants/CedarModel';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { CedarArtifactType } from '../../model/cedar/types/beans/CedarArtifactType';
import { JavascriptType } from '../../model/cedar/types/beans/JavascriptType';
import { TemplateProperty } from '../../model/cedar/constants/TemplateProperty';
import { ReaderUtil } from './ReaderUtil';
import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { ObjectComparator } from '../../model/cedar/util/compare/ObjectComparator';
import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { ComparisonError } from '../../model/cedar/util/compare/ComparisonError';
import { CedarContainerChildInfo } from '../../model/cedar/types/beans/CedarContainerChildInfo';
import { CedarContainerChildrenInfo } from '../../model/cedar/types/beans/CedarContainerChildrenInfo';
import { CedarJsonPath } from '../../model/cedar/util/path/CedarJsonPath';
import { ComparisonErrorType } from '../../model/cedar/util/compare/ComparisonErrorType';
import { JSONReaderBehavior } from '../../behavior/JSONReaderBehavior';
import { UiInputType } from '../../model/cedar/types/beans/UiInputType';
import { CedarJSONTemplateFieldContentDynamic } from '../../model/cedar/util/serialization/CedarJSONTemplateFieldContentDynamic';
import { JSONElementReaderResult } from './JSONElementReaderResult';
import { CedarElement } from '../../model/cedar/element/CedarElement';
import { JSONContainerArtifactReader } from './JSONContainerArtifactReader';
import { CedarJSONElementContent } from '../../model/cedar/util/serialization/CedarJSONElementContent';
import { JSONElementWriter } from '../writer/JSONElementWriter';

export class JSONElementReader extends JSONContainerArtifactReader {
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

    JSONElementReader.readNonReportableAttributes(element, elementSourceObject);
    JSONElementReader.readReportableAttributes(element, elementSourceObject, parsingResult);
    // TODO: this is not neededJSONElementReader.readInstanceTypeSpecification(template, elementSourceObject, parsingResult);
    this.readAndValidateChildrenInfo(element, elementSourceObject, parsingResult, topPath);

    return new JSONElementReaderResult(element, parsingResult, elementSourceObject);
  }

  protected static readNonReportableAttributes(element: CedarElement, elementSourceObject: JsonNode) {
    super.readNonReportableAttributes(element, elementSourceObject);
  }

  private static readReportableAttributes(element: CedarElement, elementSourceObject: JsonNode, parsingResult: ParsingResult) {
    // Read and validate, but do not store top level @type
    ObjectComparator.comparePrimitive(
      parsingResult,
      CedarArtifactType.TEMPLATE_ELEMENT.getValue(),
      ReaderUtil.getString(elementSourceObject, JsonSchema.atType),
      new CedarJsonPath(JsonSchema.atType),
    );

    // Read and validate, but do not store top level @context
    const topContextNode: JsonNode = ReaderUtil.getNode(elementSourceObject, JsonSchema.atContext);
    const blueprint = CedarJSONElementContent.CONTEXT_VERBATIM;
    ObjectComparator.compareBothWays(parsingResult, blueprint, topContextNode, new CedarJsonPath(JsonSchema.atContext));

    // Read and validate, but do not store top level type
    ObjectComparator.comparePrimitive(
      parsingResult,
      JavascriptType.OBJECT.getValue(),
      ReaderUtil.getString(elementSourceObject, CedarModel.type),
      new CedarJsonPath(CedarModel.type),
    );

    // Read and validate, but do not store top level additionalProperties
    // TODO: this is either false, or verbatim CedarJSONTemplateFieldContentStatic.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE
    // ObjectComparator.comparePrimitive(
    //   parsingResult,
    //   false,
    //   ReaderUtil.getBoolean(templateSourceObject, TemplateProperty.additionalProperties),
    //   new CedarJsonPath(TemplateProperty.additionalProperties),
    // );

    // Read and validate, but do not store top level $schema
    ObjectComparator.comparePrimitive(
      parsingResult,
      CedarSchema.CURRENT.getValue(),
      ReaderUtil.getString(elementSourceObject, CedarModel.schema),
      new CedarJsonPath(CedarModel.schema),
    );
  }

  private readAndValidateChildrenInfo(
    element: CedarElement,
    elementSourceObject: JsonNode,
    parsingResult: ParsingResult,
    path: CedarJsonPath,
  ) {
    const elementRequired: Array<string> = ReaderUtil.getStringList(elementSourceObject, JsonSchema.required);
    const elementProperties: JsonNode = ReaderUtil.getNode(elementSourceObject, JsonSchema.properties);

    // Generate a map of the "required" list for caching reasons
    const elementRequiredMap: Map<string, boolean> = elementRequired.reduce((acc, current) => {
      acc.set(current, true);
      return acc;
    }, new Map<string, boolean>());

    // Check if all the keys of the "required" blueprint are present in the template's "required"
    for (const key of CedarJSONElementContent.REQUIRED_PARTIAL) {
      if (!elementRequiredMap.has(key)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError('jtr01', ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, new CedarJsonPath(JsonSchema.required), key),
        );
      }
    }

    // Generate the candidate children names list based on the unknown keys of "properties"
    const candidateChildrenInfo: CedarContainerChildrenInfo = new CedarContainerChildrenInfo();
    Object.keys(elementProperties).forEach((key) => {
      if (!CedarJSONElementContent.PROPERTIES_PARTIAL_KEY_MAP.has(key)) {
        const propertiesChildNode: JsonNode = ReaderUtil.getNode(elementProperties, key);

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
      if (!elementRequiredMap.has(childName)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError('jtr02', ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, new CedarJsonPath(JsonSchema.required), childName),
        );
      }
    }

    // Check if "required" contains extra nodes (not in blueprint, not in children name list)
    for (const key of elementRequired) {
      if (!CedarJSONElementContent.REQUIRED_PARTIAL_KEY_MAP.has(key) && !candidateChildrenInfo.has(key)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError('jtr03', ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT, new CedarJsonPath(JsonSchema.required), key),
        );
      }
    }

    // Extract _ui/propertyLabels
    const elementUI: JsonNode = ReaderUtil.getNode(elementSourceObject, CedarModel.ui);
    const elementUIPLabels = ReaderUtil.getStringMap(elementUI, CedarModel.propertyLabels);
    for (const childInfo of candidateChildrenInfo.children) {
      if (elementUIPLabels === null || !elementUIPLabels.has(childInfo.name)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError(
            'jtr04',
            ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
            new CedarJsonPath(CedarModel.ui, CedarModel.propertyLabels),
            childInfo.name,
          ),
        );
      } else {
        childInfo.label = elementUIPLabels.get(childInfo.name) ?? null;
      }
    }

    // Extract _ui/propertyDescriptions
    const elementUIPDescriptions = ReaderUtil.getStringMap(elementUI, CedarModel.propertyDescriptions);
    for (const childInfo of candidateChildrenInfo.children) {
      if (elementUIPDescriptions === null || !elementUIPDescriptions.has(childInfo.name)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError(
            'jtr05',
            ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
            new CedarJsonPath(CedarModel.ui, CedarModel.propertyDescriptions),
            childInfo.name,
          ),
        );
      } else {
        childInfo.description = elementUIPDescriptions.get(childInfo.name) ?? null;
      }
    }

    // Get the IRI mappings
    // TODO: no IRI mapping for attribute values
    const elementPropertiesContext: JsonNode = ReaderUtil.getNode(elementProperties, JsonSchema.atContext);
    const elementIRIMap: JsonNode = ReaderUtil.getNode(elementPropertiesContext, JsonSchema.properties);
    for (const childInfo of candidateChildrenInfo.children) {
      if (childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD && childInfo.uiInputType !== UiInputType.ATTRIBUTE_VALUE) {
        const iriEnum: JsonNode = ReaderUtil.getNode(elementIRIMap, childInfo.name);
        const iriList: Array<string> = ReaderUtil.getStringList(iriEnum, JsonSchema.enum);
        if (iriList === null || iriList.length != 1) {
          parsingResult.addBlueprintComparisonError(
            new ComparisonError(
              'jtr06',
              ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
              new CedarJsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.properties, childInfo.name, JsonSchema.enum, 0),
            ),
          );
        } else {
          childInfo.iri = iriList[0];
        }
      }
    }

    // Generate final child info, based on the order and content of _ui/order. Disregard candidates not present in _ui/order with an error
    const elementUIOrder = ReaderUtil.getStringList(elementUI, CedarModel.order);
    const finalChildrenInfo = new CedarContainerChildrenInfo();
    for (const key of elementUIOrder) {
      const candidate = candidateChildrenInfo.get(key);
      if (candidate !== null && candidate !== undefined) {
        finalChildrenInfo.add(candidate);
      } else {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError(
            'jtr07',
            ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
            new CedarJsonPath(CedarModel.ui, CedarModel.order),
            null,
            key,
          ),
        );
      }
    }

    // Children present in the 'properties' but not in the 'order' will also result in error
    for (const childInfo of candidateChildrenInfo.children) {
      if (!elementUIOrder.includes(childInfo.name)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError(
            'jtr08',
            ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
            new CedarJsonPath(CedarModel.ui, CedarModel.order),
            childInfo.name,
            null,
          ),
        );
      }
    }
    element.childrenInfo = finalChildrenInfo;

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
    ObjectComparator.compareToLeft(parsingResult, blueprint, elementProperties, new CedarJsonPath(JsonSchema.properties));

    // Parse children
    // TODO: handle elements, generalize this code, since it will be used in templates and elements as well
    for (const childInfo of finalChildrenInfo.children) {
      let childDefinition: JsonNode = ReaderUtil.getNode(elementProperties, childInfo.name);
      let childPath: CedarJsonPath = new CedarJsonPath(JsonSchema.properties, childInfo.name);
      if (childInfo.multiInstance) {
        childDefinition = ReaderUtil.getNode(childDefinition, JsonSchema.items);
        childPath = childPath.add(JsonSchema.items);
      }
      if (childInfo.atType === CedarArtifactType.TEMPLATE_FIELD || childInfo.atType === CedarArtifactType.STATIC_TEMPLATE_FIELD) {
        const cedarFieldReaderResult = this.fieldReader.readFromObject(childDefinition, childPath);
        element.addChild(cedarFieldReaderResult.field);
        parsingResult.merge(cedarFieldReaderResult.parsingResult);
      } else if (childInfo.atType === CedarArtifactType.TEMPLATE_ELEMENT) {
        const cedarElementReaderResult = this.readFromObject(childDefinition, childPath);
        element.addChild(cedarElementReaderResult.element);
        parsingResult.merge(cedarElementReaderResult.parsingResult);
      }
    }
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
