import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { LinkField } from './LinkField';
import { JsonTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JsonTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { LinkFieldImpl } from './LinkFieldImpl';

export class JsonFieldReaderLink extends JsonTemplateFieldTypeSpecificReader {
  override read(fieldSourceObject: JsonNode, childInfo: ChildDeploymentInfo, _parsingResult: ParsingResult, _path: JsonPath): LinkField {
    const field = LinkFieldImpl.buildEmpty();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);
    return field;
  }
}
