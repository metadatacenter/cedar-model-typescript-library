import { JsonNode } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { JSONTemplateFieldWriterInternal } from '../../../../../io/writer/json/JSONTemplateFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { ListField } from './ListField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { CedarJSONWriters } from '../../../../../io/writer/json/CedarJSONWriters';

export class JSONFieldWriterList extends JSONTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarJSONWriters) {
    super(behavior, writers);
  }

  override expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: ListField, childInfo: ChildDeploymentInfo): void {
    super.expandValueConstraintsNodeForJSON(vcNode, field, childInfo);
    vcNode[CedarModel.multipleChoice] = field.multipleChoice;
    this.expandLiterals(field, vcNode);
  }
}
