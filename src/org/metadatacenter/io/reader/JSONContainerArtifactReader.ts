import { JSONReaderBehavior } from '../../behavior/JSONReaderBehavior';
import { JSONAbstractArtifactReader } from './JSONAbstractArtifactReader';
import { JSONFieldReader } from './JSONFieldReader';
import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { CedarContainerChildrenInfo } from '../../model/cedar/types/beans/CedarContainerChildrenInfo';
import { CedarJsonPath } from '../../model/cedar/util/path/CedarJsonPath';
import { CedarContainerChildInfo } from '../../model/cedar/types/beans/CedarContainerChildInfo';
import { CedarArtifactType } from '../../model/cedar/types/beans/CedarArtifactType';
import { ReaderUtil } from './ReaderUtil';
import { JsonSchema } from '../../model/cedar/constants/JsonSchema';
import { CedarModel } from '../../model/cedar/constants/CedarModel';
import { UiInputType } from '../../model/cedar/types/beans/UiInputType';
import { ComparisonError } from '../../model/cedar/util/compare/ComparisonError';
import { ComparisonErrorType } from '../../model/cedar/util/compare/ComparisonErrorType';
import { CedarElement } from '../../model/cedar/element/CedarElement';
import { ObjectComparator } from '../../model/cedar/util/compare/ObjectComparator';
import { CedarJSONElementContent } from '../../model/cedar/util/serialization/CedarJSONElementContent';
import { JavascriptType } from '../../model/cedar/types/beans/JavascriptType';
import { CedarSchema } from '../../model/cedar/types/beans/CedarSchema';
import { CedarContainerAbstractArtifact } from '../../model/cedar/CedarAbstractContainerArtifact';
import { JSONElementReader } from './JSONElementReader';

export abstract class JSONContainerArtifactReader extends JSONAbstractArtifactReader {
  protected fieldReader: JSONFieldReader;

  protected constructor(behavior: JSONReaderBehavior) {
    super(behavior);
    this.fieldReader = JSONFieldReader.getForBehavior(behavior);
  }

  protected abstract getElementReader(): JSONElementReader;

  protected abstract includeInIRIMapping(childInfo: CedarContainerChildInfo): boolean;

  protected readAndStoreCandidateChildInfo(
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

  protected readReportableAttributes(
    element: CedarElement,
    elementSourceObject: JsonNode,
    parsingResult: ParsingResult,
    path: CedarJsonPath,
  ) {
    // Read and validate, but do not store top level @type
    ObjectComparator.comparePrimitive(
      parsingResult,
      this.knownArtifactType.getValue(),
      ReaderUtil.getString(elementSourceObject, JsonSchema.atType),
      path.add(JsonSchema.atType),
    );

    // Read and validate, but do not store top level @context
    const topContextNode: JsonNode = ReaderUtil.getNode(elementSourceObject, JsonSchema.atContext);
    const blueprint = CedarJSONElementContent.CONTEXT_VERBATIM;
    ObjectComparator.compareBothWays(parsingResult, blueprint, topContextNode, path.add(JsonSchema.atContext));

    // Read and validate, but do not store top level type
    ObjectComparator.comparePrimitive(
      parsingResult,
      JavascriptType.OBJECT.getValue(),
      ReaderUtil.getString(elementSourceObject, CedarModel.type),
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
      ReaderUtil.getString(elementSourceObject, CedarModel.schema),
      path.add(CedarModel.schema),
    );
  }

  protected parseChildren(
    finalChildrenInfo: CedarContainerChildrenInfo,
    containerProperties: JsonNode,
    container: CedarContainerAbstractArtifact,
    parsingResult: ParsingResult,
    path: CedarJsonPath,
  ) {
    // Parse children
    // TODO: handle elements, generalize this code, since it will be used in templates and elements as well
    for (const childInfo of finalChildrenInfo.children) {
      let childDefinition: JsonNode = ReaderUtil.getNode(containerProperties, childInfo.name);
      let childPath: CedarJsonPath = path.add(JsonSchema.properties, childInfo.name);
      if (childInfo.multiInstance) {
        childDefinition = ReaderUtil.getNode(childDefinition, JsonSchema.items);
        childPath = childPath.add(JsonSchema.items);
      }
      if (childInfo.atType === CedarArtifactType.TEMPLATE_FIELD || childInfo.atType === CedarArtifactType.STATIC_TEMPLATE_FIELD) {
        const cedarFieldReaderResult = this.fieldReader.readFromObject(childDefinition, childInfo, childPath);
        container.addChild(cedarFieldReaderResult.field);
        parsingResult.merge(cedarFieldReaderResult.parsingResult);
      } else if (childInfo.atType === CedarArtifactType.TEMPLATE_ELEMENT) {
        const cedarElementReaderResult = this.getElementReader().readFromObject(childDefinition, childInfo, childPath);
        container.addChild(cedarElementReaderResult.element);
        parsingResult.merge(cedarElementReaderResult.parsingResult);
      }
    }
  }

  protected validatePropertiesVsOrder(
    candidateChildrenInfo: CedarContainerChildrenInfo,
    containerUIOrder: string[],
    parsingResult: ParsingResult,
    path: CedarJsonPath,
  ) {
    // Children present in the 'properties' but not in the 'order' will also result in error
    for (const childInfo of candidateChildrenInfo.children) {
      if (!containerUIOrder.includes(childInfo.name)) {
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
  }

  protected finalizeChildInfo(
    elementUIOrder: string[],
    candidateChildrenInfo: CedarContainerChildrenInfo,
    parsingResult: ParsingResult,
    path: CedarJsonPath,
  ): CedarContainerChildrenInfo {
    // Generate final child info, based on the order and content of _ui/order. Disregard candidates not present in _ui/order with an error
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
            path.add(CedarModel.ui, CedarModel.order),
            null,
            key,
          ),
        );
      }
    }
    return finalChildrenInfo;
  }

  protected getCandidateChildrenInfo(
    containerProperties: JsonNode,
    partialKeyMap: Map<string, boolean>,
    parsingResult: ParsingResult,
    path: CedarJsonPath,
  ): CedarContainerChildrenInfo {
    // Generate the candidate children names list based on the unknown keys of "properties"
    const candidateChildrenInfo: CedarContainerChildrenInfo = new CedarContainerChildrenInfo();
    Object.keys(containerProperties).forEach((key) => {
      if (!partialKeyMap.has(key)) {
        const propertiesChildNode: JsonNode = ReaderUtil.getNode(containerProperties, key);

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
    return candidateChildrenInfo;
  }

  protected generateAndValidateRequiredMap(
    elementRequired: Array<string>,
    requiredPartial: Array<string>,
    parsingResult: ParsingResult,
    path: CedarJsonPath,
  ): Map<string, boolean> {
    // Generate a map of the "required" list for caching reasons
    const elementRequiredMap: Map<string, boolean> = elementRequired.reduce((acc, current) => {
      acc.set(current, true);
      return acc;
    }, new Map<string, boolean>());

    // Check if all the keys of the "required" blueprint are present in the template's "required"
    for (const key of requiredPartial) {
      if (!elementRequiredMap.has(key)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError('jtr01', ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, path.add(JsonSchema.required), key),
        );
      }
    }
    return elementRequiredMap;
  }

  protected checkRequiredBothWays(
    candidateChildrenInfo: CedarContainerChildrenInfo,
    elementRequiredMap: Map<string, boolean>,
    elementRequired: Array<string>,
    requiredPartialKeyMap: Map<string, boolean>,
    parsingResult: ParsingResult,
    path: CedarJsonPath,
  ) {
    // Check if all candidate children are present in the "required". Static fields don't need to be there
    const childNames: Array<string> = candidateChildrenInfo.getChildrenNamesForRequired();
    for (const childName of childNames) {
      if (!elementRequiredMap.has(childName)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError('jtr02', ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, path.add(JsonSchema.required), childName),
        );
      }
    }

    // Check if "required" contains extra nodes (not in blueprint, not in children name list)
    for (const key of elementRequired) {
      if (!requiredPartialKeyMap.has(key) && !candidateChildrenInfo.has(key)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError('jtr03', ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT, path.add(JsonSchema.required), key),
        );
      }
    }
  }

  protected extractUIPreferredLabelsAndDescriptions(
    containerUI: JsonNode,
    candidateChildrenInfo: CedarContainerChildrenInfo,
    parsingResult: ParsingResult,
    path: CedarJsonPath,
  ) {
    // Extract _ui/propertyLabels
    const containerUIPLabels = ReaderUtil.getStringMap(containerUI, CedarModel.propertyLabels);
    for (const childInfo of candidateChildrenInfo.children) {
      if (containerUIPLabels === null || !containerUIPLabels.has(childInfo.name)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError(
            'jtr04',
            ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
            path.add(CedarModel.ui, CedarModel.propertyLabels),
            childInfo.name,
          ),
        );
      } else {
        childInfo.label = containerUIPLabels.get(childInfo.name) ?? null;
      }
    }

    // Extract _ui/propertyDescriptions
    const containerUIPDescriptions = ReaderUtil.getStringMap(containerUI, CedarModel.propertyDescriptions);
    for (const childInfo of candidateChildrenInfo.children) {
      if (containerUIPDescriptions === null || !containerUIPDescriptions.has(childInfo.name)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError(
            'jtr05',
            ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
            path.add(CedarModel.ui, CedarModel.propertyDescriptions),
            childInfo.name,
          ),
        );
      } else {
        childInfo.description = containerUIPDescriptions.get(childInfo.name) ?? null;
      }
    }
  }

  protected extractIRIMappings(
    elementProperties: JsonNode,
    candidateChildrenInfo: CedarContainerChildrenInfo,
    parsingResult: ParsingResult,
    path: CedarJsonPath,
  ) {
    // Get the IRI mappings
    const elementPropertiesContext: JsonNode = ReaderUtil.getNode(elementProperties, JsonSchema.atContext);
    const elementIRIMap: JsonNode = ReaderUtil.getNode(elementPropertiesContext, JsonSchema.properties);
    for (const childInfo of candidateChildrenInfo.children) {
      if (this.includeInIRIMapping(childInfo)) {
        const iriEnum: JsonNode = ReaderUtil.getNode(elementIRIMap, childInfo.name);
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
  }
}
