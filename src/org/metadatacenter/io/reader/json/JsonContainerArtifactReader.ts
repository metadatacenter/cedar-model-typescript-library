import { JsonReaderBehavior } from '../../../behavior/JsonReaderBehavior';
import { JsonAbstractSchemaArtifactReader } from './JsonAbstractSchemaArtifactReader';
import { JsonTemplateFieldReader } from './JsonTemplateFieldReader';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../model/cedar/util/compare/JsonArtifactParsingResult';
import { ContainerArtifactChildrenInfo } from '../../../model/cedar/deployment/ContainerArtifactChildrenInfo';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { ReaderUtil } from '../ReaderUtil';
import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { UiInputType } from '../../../model/cedar/types/wrapped-types/UiInputType';
import { ComparisonError } from '../../../model/cedar/util/compare/ComparisonError';
import { ComparisonErrorType } from '../../../model/cedar/util/compare/ComparisonErrorType';
import { JsonObjectComparator } from '../../../model/cedar/util/compare/JsonObjectComparator';
import { JavascriptType } from '../../../model/cedar/types/wrapped-types/JavascriptType';
import { ArtifactSchema } from '../../../model/cedar/types/wrapped-types/ArtifactSchema';
import { AbstractContainerArtifact } from '../../../model/cedar/AbstractContainerArtifact';
import { JsonTemplateElementReader } from './JsonTemplateElementReader';
import { JsonContainerArtifactContent } from '../../../model/cedar/util/serialization/JsonContainerArtifactContent';
import { AbstractDynamicChildDeploymentInfo } from '../../../model/cedar/deployment/AbstractDynamicChildDeploymentInfo';
import { ChildDeploymentInfoBuilder } from '../../../model/cedar/deployment/ChildDeploymentInfoBuilder';
import { ChildDeploymentInfoStaticBuilder } from '../../../model/cedar/deployment/ChildDeploymentInfoStaticBuilder';
import { AbstractDynamicChildDeploymentInfoBuilder } from '../../../model/cedar/deployment/AbstractDynamicChildDeploymentInfoBuilder';
import { AbstractChildDeploymentInfo } from '../../../model/cedar/deployment/AbstractChildDeploymentInfo';
import { Language } from '../../../model/cedar/types/wrapped-types/Language';

export abstract class JsonContainerArtifactReader extends JsonAbstractSchemaArtifactReader {
  protected fieldReader: JsonTemplateFieldReader;

  protected constructor(behavior: JsonReaderBehavior) {
    super(behavior);
    this.fieldReader = JsonTemplateFieldReader.getForBehavior(behavior);
  }

  protected abstract getElementReader(): JsonTemplateElementReader;

  protected abstract includeInIRIMapping(childInfo: AbstractChildDeploymentInfo): boolean;

  protected readAndStoreCandidateChildInfo(
    childDefinitionNode: JsonNode,
    childCandidateName: string,
    parsingResult: JsonArtifactParsingResult,
    candidateChildrenInfo: ContainerArtifactChildrenInfo,
    path: JsonPath,
  ): ChildDeploymentInfo | null {
    const atType: CedarArtifactType = CedarArtifactType.forValue(ReaderUtil.getString(childDefinitionNode, JsonSchema.atType));
    if (atType !== CedarArtifactType.NULL) {
      const childInfo: ChildDeploymentInfo = new ChildDeploymentInfo(childCandidateName);
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
    container: AbstractContainerArtifact,
    elementSourceObject: JsonNode,
    parsingResult: JsonArtifactParsingResult,
    path: JsonPath,
  ) {
    // Read and validate, but do not store top level @type
    JsonObjectComparator.comparePrimitive(
      parsingResult,
      this.knownArtifactType.getValue(),
      ReaderUtil.getString(elementSourceObject, JsonSchema.atType),
      path.add(JsonSchema.atType),
    );

    // Read and validate, but do not store top level @context
    const topContextNode: JsonNode = ReaderUtil.getNode(elementSourceObject, JsonSchema.atContext);

    const blueprintAtContext: JsonNode = JsonContainerArtifactContent.CONTEXT_VERBATIM;

    JsonObjectComparator.compareBothWays(parsingResult, blueprintAtContext, topContextNode, path.add(JsonSchema.atContext), this.behavior, [
      JsonSchema.atLanguage,
    ]);

    // Read and validate, but do not store top level type
    JsonObjectComparator.comparePrimitive(
      parsingResult,
      JavascriptType.OBJECT.getValue(),
      ReaderUtil.getString(elementSourceObject, CedarModel.type),
      path.add(CedarModel.type),
    );

    // Read and validate, but do not store top level additionalProperties
    // TODO: this is either false, or verbatim CedarJsonTemplateFieldContentStatic.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE
    // ObjectComparator.comparePrimitive(
    //   parsingResult,
    //   false,
    //   ReaderUtil.getBoolean(templateSourceObject, TemplateProperty.additionalProperties),
    //   path.add(TemplateProperty.additionalProperties),
    // );

    // Read and validate, but do not store top level $schema
    JsonObjectComparator.comparePrimitive(
      parsingResult,
      ArtifactSchema.CURRENT.getValue(),
      ReaderUtil.getString(elementSourceObject, CedarModel.schema),
      path.add(CedarModel.schema),
    );

    container.language = Language.forValue(ReaderUtil.getString(topContextNode, JsonSchema.atLanguage));
  }

  protected parseChildren(
    finalChildrenInfo: ContainerArtifactChildrenInfo,
    containerProperties: JsonNode,
    container: AbstractContainerArtifact,
    parsingResult: JsonArtifactParsingResult,
    path: JsonPath,
  ) {
    // Parse children
    // TODO: handle elements, generalize this code, since it will be used in templates and elements as well
    for (const childInfo of finalChildrenInfo.children) {
      let childDefinition: JsonNode = ReaderUtil.getNode(containerProperties, childInfo.name);
      let childPath: JsonPath = path.add(JsonSchema.properties, childInfo.name);
      if (childInfo.isMultiInAnyWay()) {
        childDefinition = ReaderUtil.getNode(childDefinition, JsonSchema.items);
        childPath = childPath.add(JsonSchema.items);
      }
      if (childInfo.atType === CedarArtifactType.STATIC_TEMPLATE_FIELD) {
        const cedarFieldReaderResult = this.fieldReader.readFromObject(childDefinition, childInfo, childPath);
        const finalChildInfoBuilder: ChildDeploymentInfoStaticBuilder = cedarFieldReaderResult.field
          .createDeploymentBuilder(childInfo.name)
          .withLabel(childInfo.label)
          .withDescription(childInfo.description);
        const finalChildInfo = finalChildInfoBuilder.build();
        container.addChild(cedarFieldReaderResult.field, finalChildInfo);
        parsingResult.merge(cedarFieldReaderResult.parsingResult);
      } else if (childInfo.atType === CedarArtifactType.TEMPLATE_FIELD) {
        const cedarFieldReaderResult = this.fieldReader.readFromObject(childDefinition, childInfo, childPath);
        const finalChildInfoBuilder: AbstractDynamicChildDeploymentInfoBuilder = cedarFieldReaderResult.field.createDeploymentBuilder(
          childInfo.name,
        ) as AbstractDynamicChildDeploymentInfoBuilder;
        const dynaChildInfo: AbstractDynamicChildDeploymentInfo = childInfo as AbstractDynamicChildDeploymentInfo;
        // console.log('CHILD INFO1:', childInfo);
        finalChildInfoBuilder
          .withIri(dynaChildInfo.iri)
          .withHidden(dynaChildInfo.hidden)
          .withContinuePreviousLine(dynaChildInfo.continuePreviousLine)
          .withLabel(childInfo.label)
          .withDescription(childInfo.description)
          .withRecommendedValue(dynaChildInfo.recommendedValue)
          .withRequiredValue(dynaChildInfo.requiredValue);
        if (finalChildInfoBuilder instanceof ChildDeploymentInfoBuilder) {
          const currentInfo = childInfo as any as ChildDeploymentInfo;
          finalChildInfoBuilder
            .withMultiInstance(currentInfo.multiInstance)
            .withMinItems(currentInfo.minItems)
            .withMaxItems(currentInfo.maxItems);
        }
        const finalChildInfo = finalChildInfoBuilder.build();
        // console.log('CHILD INFO2:', finalChildInfo);
        container.addChild(cedarFieldReaderResult.field, finalChildInfo);
        parsingResult.merge(cedarFieldReaderResult.parsingResult);
      } else if (childInfo.atType === CedarArtifactType.TEMPLATE_ELEMENT) {
        const cedarElementReaderResult = this.getElementReader().readFromObject(childDefinition, childInfo, childPath);
        container.addChild(cedarElementReaderResult.element, childInfo);
        parsingResult.merge(cedarElementReaderResult.parsingResult);
      }
    }
  }

  protected validatePropertiesVsOrder(
    candidateChildrenInfo: ContainerArtifactChildrenInfo,
    containerUIOrder: string[],
    parsingResult: JsonArtifactParsingResult,
    path: JsonPath,
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
    candidateChildrenInfo: ContainerArtifactChildrenInfo,
    parsingResult: JsonArtifactParsingResult,
    path: JsonPath,
  ): ContainerArtifactChildrenInfo {
    // Generate final child info, based on the order and content of _ui/order. Disregard candidates not present in _ui/order with an error
    const finalChildrenInfo = new ContainerArtifactChildrenInfo();
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
    parsingResult: JsonArtifactParsingResult,
    path: JsonPath,
  ): ContainerArtifactChildrenInfo {
    // Generate the candidate children names list based on the unknown keys of "properties"
    const candidateChildrenInfo: ContainerArtifactChildrenInfo = new ContainerArtifactChildrenInfo();
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
            const childInfo: ChildDeploymentInfo | null = this.readAndStoreCandidateChildInfo(
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
    parsingResult: JsonArtifactParsingResult,
    path: JsonPath,
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
    candidateChildrenInfo: ContainerArtifactChildrenInfo,
    elementRequiredMap: Map<string, boolean>,
    elementRequired: Array<string>,
    requiredPartialKeyMap: Map<string, boolean>,
    parsingResult: JsonArtifactParsingResult,
    path: JsonPath,
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
    candidateChildrenInfo: ContainerArtifactChildrenInfo,
    parsingResult: JsonArtifactParsingResult,
    path: JsonPath,
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
    candidateChildrenInfo: ContainerArtifactChildrenInfo,
    parsingResult: JsonArtifactParsingResult,
    path: JsonPath,
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
          if (childInfo instanceof AbstractDynamicChildDeploymentInfo) {
            childInfo.iri = iriList[0];
          }
        }
      }
    }
  }

  protected readInstanceTypeSpecification(
    artifact: AbstractContainerArtifact,
    artifactSourceObject: JsonNode,
    _parsingResult: JsonArtifactParsingResult,
  ) {
    const properties: JsonNode = ReaderUtil.getNode(artifactSourceObject, JsonSchema.properties);
    if (properties !== null) {
      const atType: JsonNode = ReaderUtil.getNode(properties, JsonSchema.atType);
      if (atType !== null) {
        const oneOf: Array<JsonNode> = ReaderUtil.getNodeList(atType, JsonSchema.oneOf);
        if (oneOf !== null) {
          oneOf.forEach((item) => {
            const oneOfEnum = ReaderUtil.getStringList(item, JsonSchema.enum);
            if (oneOfEnum != null && oneOfEnum.length > 0) {
              artifact.instanceTypeSpecification = oneOfEnum[0];
            }
          });
        }
      }
    }
  }
}
