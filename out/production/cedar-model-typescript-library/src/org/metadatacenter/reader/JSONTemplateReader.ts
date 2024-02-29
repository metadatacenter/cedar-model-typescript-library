import { CedarTemplate } from '../model/cedar/template/CedarTemplate';
import { CedarSchema } from '../model/cedar/template/beans/CedarSchema';
import { CedarModel } from '../model/cedar/CedarModel';
import { JsonSchema } from '../model/cedar/constants/JsonSchema';
import { CedarArtifactType } from '../model/cedar/template/beans/CedarArtifactTypeValue';
import { JavascriptType } from '../model/cedar/template/beans/JavascriptType';
import { TemplateProperty } from '../model/cedar/constants/TemplateProperty';
import { CedarUser } from '../model/cedar/template/beans/CedarUser';
import { CedarDate } from '../model/cedar/template/beans/CedarDate';
import { SchemaVersion } from '../model/cedar/template/beans/SchemaVersion';
import { BiboStatus } from '../model/cedar/template/beans/BiboStatus';
import { CedarTemplateRequiredList } from '../model/cedar/template/beans/CedarTemplateRequiredList';
import { CedarTemplateUI } from '../model/cedar/template/beans/CedarTemplateUI';
import { ReaderUtil } from './ReaderUtil';
import { Node } from '../model/cedar/types/Node';
import { PavVersion } from '../model/cedar/template/beans/PavVersion';
import { CedarArtifactId } from '../model/cedar/template/beans/CedarArtifactId';
import { CedarTemplateContent } from '../model/cedar/serialization/CedarTemplateContent';
import { ObjectComparator } from '../model/cedar/compare/ObjectComparator';
import { ParsingResult } from '../model/cedar/compare/ParsingResult';
import { JSONTemplateReaderResult } from './JSONTemplateReaderResult';
import { ComparisonError } from '../model/cedar/compare/ComparisonError';

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
    this.readAndValidateChildrenInfo(templateSourceObject, parsingResult);

    if (!parsingResult.wasSuccessful()) {
      console.log('PARSING RESULT', parsingResult);
    }

    return new JSONTemplateReaderResult(template, parsingResult);
  }

  private static readNonReportableAttributes(template: CedarTemplate, templateSourceObject: Node) {
    // Read in non-reportable properties
    template.at_id = CedarArtifactId.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.atId));
    template.title = ReaderUtil.getString(templateSourceObject, TemplateProperty.title);
    template.description = ReaderUtil.getString(templateSourceObject, TemplateProperty.description);

    template.ui = CedarTemplateUI.fromNode(ReaderUtil.getNode(templateSourceObject, CedarModel.ui));

    template.required = CedarTemplateRequiredList.fromList(ReaderUtil.getStringList(templateSourceObject, JsonSchema.required));

    template.schema_name = ReaderUtil.getString(templateSourceObject, JsonSchema.schemaName);
    template.schema_description = ReaderUtil.getString(templateSourceObject, JsonSchema.schemaDescription);
    template.pav_createdBy = CedarUser.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.pavCreatedBy));
    template.pav_createdOn = CedarDate.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.pavCreatedOn));
    template.oslc_modifiedBy = CedarUser.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.oslcModifiedBy));
    template.pav_lastUpdatedOn = CedarDate.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.pavLastUpdatedOn));
    template.schema_schemaVersion = SchemaVersion.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.schemaVersion));

    template.pav_version = PavVersion.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.pavVersion));
    template.bibo_status = BiboStatus.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.biboStatus));
  }

  private static readReportableAttributes(template: CedarTemplate, templateSourceObject: Node, parsingResult: ParsingResult) {
    // Read and validate, but do not store top level @type
    ObjectComparator.comparePrimitive(
      parsingResult,
      CedarArtifactType.TEMPLATE.getValue(),
      ReaderUtil.getString(templateSourceObject, JsonSchema.atType),
      JsonSchema.atType,
    );

    // Read and validate, but do not store top level @context
    const topContextNode: Node = ReaderUtil.getNode(templateSourceObject, JsonSchema.atContext);
    const blueprint = CedarTemplateContent.CONTEXT_VERBATIM;
    ObjectComparator.compare(parsingResult, blueprint, topContextNode);

    // Read and validate, but do not store top level type
    ObjectComparator.comparePrimitive(
      parsingResult,
      JavascriptType.OBJECT.getValue(),
      ReaderUtil.getString(templateSourceObject, CedarModel.type),
      CedarModel.type,
    );

    // Read and validate, but do not store top level additionalProperties
    ObjectComparator.comparePrimitive(
      parsingResult,
      false,
      ReaderUtil.getBoolean(templateSourceObject, TemplateProperty.additionalProperties),
      TemplateProperty.additionalProperties,
    );

    // Read and validate, but do not store top level $schema
    ObjectComparator.comparePrimitive(
      parsingResult,
      CedarSchema.CURRENT.getValue(),
      ReaderUtil.getString(templateSourceObject, CedarModel.schema),
      CedarModel.schema,
    );
  }

  private static readAndValidateChildrenInfo(templateSourceObject: Node, parsingResult: ParsingResult) {
    const templateRequired: Array<string> = ReaderUtil.getStringList(templateSourceObject, JsonSchema.required);
    const templateUI: Node = ReaderUtil.getNode(templateSourceObject, CedarModel.ui);
    const templateProperties: Node = ReaderUtil.getNode(templateSourceObject, JsonSchema.properties);
    const templatePropertiesContext: Node = ReaderUtil.getNode(templateProperties, JsonSchema.atContext);
    const templateIRIMap: Node = ReaderUtil.getNode(templatePropertiesContext, JsonSchema.properties);

    // Generate a map of the "required" list for caching reasons
    const templateRequiredMap: Map<string, boolean> = templateRequired.reduce((acc, current) => {
      acc.set(current, true);
      return acc;
    }, new Map<string, boolean>());

    // Check if all the keys of the "required" blueprint are present in the template's "required"
    for (const key of CedarTemplateContent.REQUIRED_PARTIAL) {
      if (!templateRequiredMap.has(key)) {
        parsingResult.addComparisonError(new ComparisonError('missingInRealObject', JsonSchema.required, key));
      }
    }

    // Generate the candidate children names list based on the unknown keys of "properties"
    const candidateChildNames: Array<string> = [];
    Object.keys(templateProperties).forEach((key) => {
      if (!CedarTemplateContent.PROPERTIES_PARTIAL_KEY_MAP.has(key)) {
        candidateChildNames.push(key);
      }
    });
    console.log(candidateChildNames);

    // Check if all candidate children are present in the "required"
    for (const key of candidateChildNames) {
      if (!templateRequiredMap.has(key)) {
        parsingResult.addComparisonError(new ComparisonError('missingInRealObject', JsonSchema.required, key));
      }
    }

    // Check if "required" contains extra nodes (not in blueprint, not in children name list)

    // Check if _ui/order, _ui/propertyLabels, _ui/propertyDescriptions matches the candidate children list

    // Generate child info, based on the order and content of _ui/order. Disregard candidates not present in _ui/order
  }
}
