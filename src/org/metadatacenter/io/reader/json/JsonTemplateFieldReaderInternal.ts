import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { JsonReaderBehavior } from '../../../behavior/JsonReaderBehavior';
import { JsonTemplateFieldReaderResult } from './JsonTemplateFieldReaderResult';
import { AbstractChildDeploymentInfo } from '../../../model/cedar/deployment/AbstractChildDeploymentInfo';
import { JsonTemplateFieldReader } from './JsonTemplateFieldReader';
import { ChildDeploymentInfo } from '../../../model/cedar/deployment/ChildDeploymentInfo';

export class JsonTemplateFieldReaderInternal extends JsonTemplateFieldReader {
  private constructor(behavior: JsonReaderBehavior) {
    super(behavior);
  }

  public static getForBehavior(behavior: JsonReaderBehavior): JsonTemplateFieldReaderInternal {
    return new JsonTemplateFieldReaderInternal(behavior);
  }

  public readFromObjectInternal(
    fieldSourceObject: JsonNode,
    childInfo?: AbstractChildDeploymentInfo,
    path?: JsonPath,
  ): JsonTemplateFieldReaderResult {
    childInfo = childInfo || ChildDeploymentInfo.standalone();
    path = path || new JsonPath();
    return super.readFromObjectInternal(fieldSourceObject, childInfo, path);
  }
}
