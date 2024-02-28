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
import { CedarTemplateContext } from '../model/cedar/template/beans/CedarTemplateContext';
import { PavVersion } from '../model/cedar/template/beans/PavVersion';
import { CedarArtifactId } from '../model/cedar/template/beans/CedarArtifactId';
import { CedarTemplateContent } from '../model/cedar/serialization/CedarTemplateContent';
import { ObjectComparator } from './ObjectComparator';

export class JSONTemplateReader {
  static readFromString(templateSourceString: string): CedarTemplate {
    let templateObject;
    try {
      templateObject = JSON.parse(templateSourceString);
    } catch (Exception) {
      templateObject = {};
    }
    return this.readFromObject(templateObject);
  }

  static readFromObject(templateSourceObject: Node): CedarTemplate {
    const template = CedarTemplate.buildEmptyWithNullValues();
    template.schema = CedarSchema.forValue(ReaderUtil.getString(templateSourceObject, CedarModel.schema));
    template.at_id = CedarArtifactId.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.atId));
    template.at_type = CedarArtifactType.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.atType));

    // template.at_context_of_template = CedarTemplateContext.fromNode(ReaderUtil.getNode(templateSourceObject, JsonSchema.atContext));

    const topContextNode: Node = ReaderUtil.getNode(templateSourceObject, JsonSchema.atContext);
    const blueprint = CedarTemplateContent.CONTEXT_VERBATIM;
    const comparisonResult = ObjectComparator.compare(blueprint, topContextNode);
    if (!comparisonResult.areEqual()) {
      console.log(comparisonResult.getErrors());
    }

    template.type = JavascriptType.forValue(ReaderUtil.getString(templateSourceObject, CedarModel.type));
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
    template.additionalProperties = ReaderUtil.getBoolean(templateSourceObject, TemplateProperty.additionalProperties);
    template.pav_version = PavVersion.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.pavVersion));
    template.bibo_status = BiboStatus.forValue(ReaderUtil.getString(templateSourceObject, JsonSchema.biboStatus));
    return template;
  }
}
