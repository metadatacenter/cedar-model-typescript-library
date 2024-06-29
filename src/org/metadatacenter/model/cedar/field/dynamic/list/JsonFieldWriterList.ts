import { JsonNode } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { JsonTemplateFieldWriterInternal } from '../../../../../io/writer/json/JsonTemplateFieldWriterInternal';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { ListField } from './ListField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';

export class JsonFieldWriterList extends JsonTemplateFieldWriterInternal {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNode(vcNode: JsonNode, field: ListField, childInfo: ChildDeploymentInfo): void {
    if (field.valueConstraints.defaultValue !== null) {
      vcNode[CedarModel.defaultValue] = field.valueConstraints.defaultValue;
    }
    this.expandLiterals(field, vcNode);
    super.expandValueConstraintsNode(vcNode, field, childInfo);
    vcNode[CedarModel.multipleChoice] = field.multipleChoice;
  }
}
