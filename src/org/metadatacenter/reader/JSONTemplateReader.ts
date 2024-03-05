import { CedarTemplate } from '../model/cedar/template/CedarTemplate';
import { CedarSchema } from '../model/cedar/beans/CedarSchema';
import { CedarModel } from '../model/cedar/CedarModel';
import { JsonSchema } from '../model/cedar/constants/JsonSchema';
import { CedarArtifactType } from '../model/cedar/beans/CedarArtifactType';
import { JavascriptType } from '../model/cedar/beans/JavascriptType';
import { TemplateProperty } from '../model/cedar/constants/TemplateProperty';
import { CedarUser } from '../model/cedar/beans/CedarUser';
import { CedarDate } from '../model/cedar/beans/CedarDate';
import { SchemaVersion } from '../model/cedar/beans/SchemaVersion';
import { BiboStatus } from '../model/cedar/beans/BiboStatus';
import { ReaderUtil } from './ReaderUtil';
import { Node } from '../model/cedar/util/types/Node';
import { PavVersion } from '../model/cedar/beans/PavVersion';
import { CedarArtifactId } from '../model/cedar/beans/CedarArtifactId';
import { CedarTemplateContent } from '../model/cedar/util/serialization/CedarTemplateContent';
import { ObjectComparator } from '../model/cedar/util/compare/ObjectComparator';
import { ParsingResult } from '../model/cedar/util/compare/ParsingResult';
import { JSONTemplateReaderResult } from './JSONTemplateReaderResult';
import { ComparisonError } from '../model/cedar/util/compare/ComparisonError';
import { CedarContainerChildInfo } from '../model/cedar/beans/CedarContainerChildInfo';
import { CedarContainerChildrenInfo } from '../model/cedar/beans/CedarContainerChildrenInfo';
import { CedarJsonPath } from '../model/cedar/util/path/CedarJsonPath';
import { ComparisonErrorType } from '../model/cedar/util/compare/ComparisonErrorType';
import { JSONFieldReader } from './JSONFieldReader';

export class JSONTemplateReader {
  static readFromString(templateSourceString: string): JSONTemplateReaderResult {
    let templateObject;
    try {
      templateObject = JSON.parse(templateSourceString);
    } catch (Exception) {
      templateObject = {};
    }
    return this.readFromObject(templateObject);
  }

  static readFromObject(templateSourceObject: Node): JSONTemplateReaderResult {
    const parsingResult: ParsingResult = new ParsingResult();
    const template = CedarTemplate.buildEmptyWithNullValues();

    this.readNonReportableAttributes(template, templateSourceObject);
    this.readReportableAttributes(template, templateSourceObject, parsingResult);
    this.readInstanceTypeSpecification(template, templateSourceObject, parsingResult);
    this.readAndValidateChildrenInfo(template, templateSourceObject, parsingResult);

    return new JSONTemplateReaderResult(template, parsingResult, templateSourceObject);
  }

  private static readNonReportableAttributes(template: CedarTemplate, templateSourceObject: Node) {
    // Read in non-reportable properties
    template.at_id = CedarArtifactId.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.atId));
    template.title = ReaderUtil.getString(templateSourceObject, TemplateProperty.title);
    template.description = ReaderUtil.getString(templateSourceObject, TemplateProperty.description);
    template.schema_name = ReaderUtil.getString(templateSourceObject, JsonSchema.schemaName);
    template.schema_description = ReaderUtil.getString(templateSourceObject, JsonSchema.schemaDescription);
    template.pav_createdBy = CedarUser.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.pavCreatedBy));
    template.pav_createdOn = CedarDate.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.pavCreatedOn));
    template.oslc_modifiedBy = CedarUser.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.oslcModifiedBy));
    template.pav_lastUpdatedOn = CedarDate.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.pavLastUpdatedOn));
    template.schema_schemaVersion = SchemaVersion.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.schemaVersion));
    template.pav_version = PavVersion.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.pavVersion));
    template.bibo_status = BiboStatus.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.biboStatus));
    template.schema_identifier = ReaderUtil.getString(templateSourceObject, JsonSchema.schemaIdentifier);
    const templateUI: Node = ReaderUtil.getNode(templateSourceObject, CedarModel.ui);
    if (templateUI !== null) {
      template.header = ReaderUtil.getString(templateUI, CedarModel.header);
      template.footer = ReaderUtil.getString(templateUI, CedarModel.footer);
    }
  }

  private static readReportableAttributes(template: CedarTemplate, templateSourceObject: Node, parsingResult: ParsingResult) {
    // Read and validate, but do not store top level @type
    ObjectComparator.comparePrimitive(
      parsingResult,
      CedarArtifactType.TEMPLATE.getValue(),
      ReaderUtil.getString(templateSourceObject, JsonSchema.atType),
      new CedarJsonPath(JsonSchema.atType),
    );

    // Read and validate, but do not store top level @context
    const topContextNode: Node = ReaderUtil.getNode(templateSourceObject, JsonSchema.atContext);
    const blueprint = CedarTemplateContent.CONTEXT_VERBATIM;
    ObjectComparator.compareBothWays(parsingResult, blueprint, topContextNode, new CedarJsonPath(JsonSchema.atContext));

    // Read and validate, but do not store top level type
    ObjectComparator.comparePrimitive(
      parsingResult,
      JavascriptType.OBJECT.getValue(),
      ReaderUtil.getString(templateSourceObject, CedarModel.type),
      new CedarJsonPath(CedarModel.type),
    );

    // Read and validate, but do not store top level additionalProperties
    ObjectComparator.comparePrimitive(
      parsingResult,
      false,
      ReaderUtil.getBoolean(templateSourceObject, TemplateProperty.additionalProperties),
      new CedarJsonPath(TemplateProperty.additionalProperties),
    );

    // Read and validate, but do not store top level $schema
    ObjectComparator.comparePrimitive(
      parsingResult,
      CedarSchema.CURRENT.getValue(),
      ReaderUtil.getString(templateSourceObject, CedarModel.schema),
      new CedarJsonPath(CedarModel.schema),
    );
  }

  private static readInstanceTypeSpecification(template: CedarTemplate, templateSourceObject: Node, parsingResult: ParsingResult) {
    const properties: Node = ReaderUtil.getNode(templateSourceObject, JsonSchema.properties);
    if (properties !== null) {
      const atType: Node = ReaderUtil.getNode(properties, JsonSchema.atType);
      if (atType !== null) {
        const oneOf: Array<Node> = ReaderUtil.getNodeList(atType, JsonSchema.oneOf);
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

  private static readAndValidateChildrenInfo(template: CedarTemplate, templateSourceObject: Node, parsingResult: ParsingResult) {
    const templateRequired: Array<string> = ReaderUtil.getStringList(templateSourceObject, JsonSchema.required);
    const templateProperties: Node = ReaderUtil.getNode(templateSourceObject, JsonSchema.properties);

    // Validate properties
    // 'properties' should have extra entry for Fields/Elements as definition
    // 'properties/context/properties' should have extra entry for Fields/Elements as IRI mappings
    // all other content should match verbatim
    const blueprint = CedarTemplateContent.PROPERTIES_PARTIAL;
    ObjectComparator.compareToLeft(parsingResult, blueprint, templateProperties, new CedarJsonPath(JsonSchema.properties));

    // Generate a map of the "required" list for caching reasons
    const templateRequiredMap: Map<string, boolean> = templateRequired.reduce((acc, current) => {
      acc.set(current, true);
      return acc;
    }, new Map<string, boolean>());

    // Check if all the keys of the "required" blueprint are present in the template's "required"
    for (const key of CedarTemplateContent.REQUIRED_PARTIAL) {
      if (!templateRequiredMap.has(key)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError(ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, new CedarJsonPath(JsonSchema.required), key),
        );
      }
    }

    // Generate the candidate children names list based on the unknown keys of "properties"
    const candidateChildrenInfo: CedarContainerChildrenInfo = new CedarContainerChildrenInfo();
    Object.keys(templateProperties).forEach((key) => {
      if (!CedarTemplateContent.PROPERTIES_PARTIAL_KEY_MAP.has(key)) {
        const propertyValue = templateProperties[key];
        if (typeof propertyValue === 'object' && propertyValue !== null && JsonSchema.atType in propertyValue) {
          const childInfo: CedarContainerChildInfo = new CedarContainerChildInfo(key);
          childInfo.atType = CedarArtifactType.forValue((propertyValue as any)['@type']);
          candidateChildrenInfo.add(childInfo);
        } else {
          parsingResult.addBlueprintComparisonError(
            new ComparisonError(
              ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
              new CedarJsonPath(JsonSchema.properties, JsonSchema.required, key, JsonSchema.atType),
            ),
          );
        }
      }
    });

    // Check if all candidate children are present in the "required". Static fields don't need to be there
    for (const childInfo of candidateChildrenInfo.children) {
      if (childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD) {
        if (!templateRequiredMap.has(childInfo.name)) {
          parsingResult.addBlueprintComparisonError(
            new ComparisonError(ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, new CedarJsonPath(JsonSchema.required), childInfo.name),
          );
        }
      }
    }

    // Check if "required" contains extra nodes (not in blueprint, not in children name list)
    for (const key of templateRequired) {
      if (!CedarTemplateContent.REQUIRED_PARTIAL_KEY_MAP.has(key) && !candidateChildrenInfo.has(key)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError(ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT, new CedarJsonPath(JsonSchema.required), key),
        );
      }
    }

    // Extract _ui/propertyLabels
    const templateUI: Node = ReaderUtil.getNode(templateSourceObject, CedarModel.ui);
    const templateUIPLabels = ReaderUtil.getStringMap(templateUI, CedarModel.propertyLabels);
    for (const childInfo of candidateChildrenInfo.children) {
      if (templateUIPLabels === null || !templateUIPLabels.has(childInfo.name)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError(
            ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
            new CedarJsonPath(CedarModel.ui, CedarModel.propertyLabels),
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
            ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
            new CedarJsonPath(CedarModel.ui, CedarModel.propertyDescriptions),
            childInfo.name,
          ),
        );
      } else {
        childInfo.description = templateUIPDescriptions.get(childInfo.name) ?? null;
      }
    }

    // Get the IRI mappings
    const templatePropertiesContext: Node = ReaderUtil.getNode(templateProperties, JsonSchema.atContext);
    const templateIRIMap: Node = ReaderUtil.getNode(templatePropertiesContext, JsonSchema.properties);
    for (const childInfo of candidateChildrenInfo.children) {
      if (childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD) {
        const iriEnum: Node = ReaderUtil.getNode(templateIRIMap, childInfo.name);
        const iriList: Array<string> = ReaderUtil.getStringList(iriEnum, JsonSchema.enum);
        if (iriList === null || iriList.length != 1) {
          parsingResult.addBlueprintComparisonError(
            new ComparisonError(
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
    const templateUIOrder = ReaderUtil.getStringList(templateUI, CedarModel.order);
    const finalChildrenInfo = new CedarContainerChildrenInfo();
    for (const key of templateUIOrder) {
      const candidate = candidateChildrenInfo.get(key);
      if (candidate !== null && candidate !== undefined) {
        finalChildrenInfo.add(candidate);
      } else {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError(
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
      if (!templateUIOrder.includes(childInfo.name)) {
        parsingResult.addBlueprintComparisonError(
          new ComparisonError(
            ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
            new CedarJsonPath(CedarModel.ui, CedarModel.order),
            childInfo.name,
            null,
          ),
        );
      }
    }
    template.childrenInfo = finalChildrenInfo;

    // Parse children
    // TODO: handle elements, generalize this code, since it will be used in templates and elements as well
    for (const childInfo of finalChildrenInfo.children) {
      const childDefinition: Node = ReaderUtil.getNode(templateProperties, childInfo.name);
      const cedarField = JSONFieldReader.readFromObject(
        childDefinition,
        parsingResult,
        new CedarJsonPath(JsonSchema.properties, childInfo.name),
      );
      if (cedarField != null) {
        template.addChild(cedarField);
      }
    }
  }

  static getRoundTripComparisonResult(jsonTemplateReaderResult: JSONTemplateReaderResult): ParsingResult {
    const compareResult = new ParsingResult();
    ObjectComparator.compareBothWays(
      compareResult,
      jsonTemplateReaderResult.templateSourceObject,
      jsonTemplateReaderResult.template.asCedarNode(),
      new CedarJsonPath(),
    );
    return compareResult;
  }
}
