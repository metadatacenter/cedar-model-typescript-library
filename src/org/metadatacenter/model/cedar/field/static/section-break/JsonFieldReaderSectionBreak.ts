import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { StaticSectionBreakField } from './StaticSectionBreakField';
import { JsonTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JsonTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { StaticSectionBreakFieldImpl } from './StaticSectionBreakFieldImpl';

export class JsonFieldReaderSectionBreak extends JsonTemplateFieldTypeSpecificReader {
  override read(
    _fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: JsonArtifactParsingResult,
    _path: JsonPath,
  ): StaticSectionBreakField {
    return StaticSectionBreakFieldImpl.buildEmpty();
  }
}
