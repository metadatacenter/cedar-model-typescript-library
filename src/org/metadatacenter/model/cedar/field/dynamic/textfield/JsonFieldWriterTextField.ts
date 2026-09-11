import { JsonNode } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { TextField } from './TextField';
import { JsonTemplateFieldWriterInternal } from '../../../../../io/writer/json/JsonTemplateFieldWriterInternal';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';
import { DefaultValueSerialization } from '../../DefaultValueSerialization';

export class JsonFieldWriterTextField extends JsonTemplateFieldWriterInternal {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNode(vcNode: JsonNode, field: TextField, childInfo: ChildDeploymentInfo): void {
    DefaultValueSerialization.writeLiteral(vcNode, CedarModel.defaultValue, field.valueConstraints.defaultValue);
    if (field.valueConstraints.minLength !== null) {
      vcNode[CedarModel.minLength] = field.valueConstraints.minLength;
    }
    if (field.valueConstraints.maxLength !== null) {
      vcNode[CedarModel.maxLength] = field.valueConstraints.maxLength;
    }
    super.expandValueConstraintsNode(vcNode, field, childInfo);
    if (field.valueConstraints.regex !== null) {
      vcNode[CedarModel.regex] = field.valueConstraints.regex;
    }
  }
}
