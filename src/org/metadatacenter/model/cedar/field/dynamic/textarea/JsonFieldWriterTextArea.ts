import { JsonTemplateFieldWriterInternal } from '../../../../../io/writer/json/JsonTemplateFieldWriterInternal';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';
import { JsonNode } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { AbstractChildDeploymentInfo } from '../../../deployment/AbstractChildDeploymentInfo';
import { TextArea } from './TextArea';

export class JsonFieldWriterTextArea extends JsonTemplateFieldWriterInternal {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  protected expandValueConstraintsNode(vcNode: JsonNode, field: TextArea, childInfo: AbstractChildDeploymentInfo): void {
    if (field.valueConstraints.defaultValue !== null) {
      vcNode[CedarModel.defaultValue] = field.valueConstraints.defaultValue;
    }
    super.expandValueConstraintsNode(vcNode, field, childInfo);
  }
}
