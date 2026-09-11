import { JsonTemplateFieldWriterInternal } from '../../../../../io/writer/json/JsonTemplateFieldWriterInternal';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';
import { JsonNode } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { AbstractChildDeploymentInfo } from '../../../deployment/AbstractChildDeploymentInfo';
import { TextArea } from './TextArea';
import { DefaultValueSerialization } from '../../DefaultValueSerialization';

export class JsonFieldWriterTextArea extends JsonTemplateFieldWriterInternal {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  protected expandValueConstraintsNode(vcNode: JsonNode, field: TextArea, childInfo: AbstractChildDeploymentInfo): void {
    DefaultValueSerialization.writeLiteral(vcNode, CedarModel.defaultValue, field.valueConstraints.defaultValue);
    super.expandValueConstraintsNode(vcNode, field, childInfo);
  }
}
