import { JsonNode } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { CedarTextField } from './CedarTextField';
import { JSONFieldWriter } from '../../../../../io/writer/JSONFieldWriter';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { CedarContainerChildInfo } from '../../../types/beans/CedarContainerChildInfo';

export class JSONFieldWriterTextField extends JSONFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandUINodeForJSON(uiNode: JsonNode, field: CedarTextField): void {
    if (field.valueRecommendationEnabled) {
      uiNode[CedarModel.valueRecommendationEnabled] = field.valueRecommendationEnabled;
    }
  }

  override expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: CedarTextField, childInfo: CedarContainerChildInfo): void {
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
