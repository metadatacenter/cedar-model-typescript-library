import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { JsonTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JsonTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { ExtRorField } from './ExtRorField';
import { ExtRorFieldImpl } from './ExtRorFieldImpl';

export class JsonFieldReaderExtRor extends JsonTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    _parsingResult: JsonArtifactParsingResult,
    _path: JsonPath,
  ): ExtRorField {
    const field = ExtRorFieldImpl.buildEmpty();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);
    return field;
  }
}
