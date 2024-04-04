import { JsonNode } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { TextField } from './TextField';
import { JSONTemplateFieldWriterInternal } from '../../../../../io/writer/json/JSONTemplateFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { CedarJSONWriters } from '../../../../../io/writer/json/CedarJSONWriters';

export class JSONFieldWriterTextField extends JSONTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarJSONWriters) {
    super(behavior, writers);
  }

  override expandUINodeForJSON(uiNode: JsonNode, field: TextField, childInfo: ChildDeploymentInfo): void {
    super.expandUINodeForJSON(uiNode, field, childInfo);
    if (field.valueRecommendationEnabled) {
      uiNode[CedarModel.valueRecommendationEnabled] = field.valueRecommendationEnabled;
    }
  }

  override expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: TextField, childInfo: ChildDeploymentInfo): void {
    super.expandValueConstraintsNodeForJSON(vcNode, field, childInfo);
    if (field.valueConstraints.defaultValue != null) {
      vcNode[CedarModel.defaultValue] = field.valueConstraints.defaultValue;
    }
    if (field.valueConstraints.minLength != null) {
      vcNode[CedarModel.minLength] = field.valueConstraints.minLength;
    }
    if (field.valueConstraints.maxLength != null) {
      vcNode[CedarModel.maxLength] = field.valueConstraints.maxLength;
    }
    if (field.valueConstraints.regex != null) {
      vcNode[CedarModel.regex] = field.valueConstraints.regex;
    }
  }
}
