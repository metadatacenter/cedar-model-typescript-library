import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { StaticSectionBreakField } from './StaticSectionBreakField';
import { JsonTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JsonTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { StaticSectionBreakFieldImpl } from './StaticSectionBreakFieldImpl';
import { CedarModel } from '../../../constants/CedarModel';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';

export class JsonFieldReaderSectionBreak extends JsonTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: JsonArtifactParsingResult,
    _path: JsonPath,
  ): StaticSectionBreakField {
    const field = StaticSectionBreakFieldImpl.buildEmpty();
    field.content = ReaderUtil.getString(ReaderUtil.getNode(fieldSourceObject, CedarModel.ui), CedarModel.content);
    return field;
  }
}
