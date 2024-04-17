import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { TextArea } from './TextArea';
import { JsonTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JsonTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { TextAreaImpl } from './TextAreaImpl';

export class JsonFieldReaderTextArea extends JsonTemplateFieldTypeSpecificReader {
  override read(fieldSourceObject: JsonNode, childInfo: ChildDeploymentInfo, _parsingResult: JsonArtifactParsingResult, _path: JsonPath): TextArea {
    const field = TextAreaImpl.buildEmpty();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);
    return field;
  }
}
