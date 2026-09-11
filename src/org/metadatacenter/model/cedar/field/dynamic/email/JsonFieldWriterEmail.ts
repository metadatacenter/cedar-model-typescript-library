import { JsonTemplateFieldWriterInternal } from '../../../../../io/writer/json/JsonTemplateFieldWriterInternal';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';
import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { CedarModel } from '../../../constants/CedarModel';
import { DefaultValueSerialization } from '../../DefaultValueSerialization';
import { EmailField } from './EmailField';

export class JsonFieldWriterEmail extends JsonTemplateFieldWriterInternal {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNode(vcNode: JsonNode, field: EmailField, childInfo: ChildDeploymentInfo): void {
    DefaultValueSerialization.writeLiteral(vcNode, CedarModel.defaultValue, field.valueConstraints.defaultValue);
    super.expandValueConstraintsNode(vcNode, field, childInfo);
  }
}
