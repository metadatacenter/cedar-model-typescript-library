import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { StaticSectionBreakField } from './StaticSectionBreakField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YAMLTemplateFieldTypeSpecificReader';

export class YAMLFieldReaderSectionBreak extends YAMLTemplateFieldTypeSpecificReader {
  override read(
    _fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): StaticSectionBreakField {
    return StaticSectionBreakField.buildEmptyWithNullValues();
  }
}
