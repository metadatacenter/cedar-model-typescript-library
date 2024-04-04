import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { StaticRichTextField } from './StaticRichTextField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YAMLTemplateFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';

export class YAMLFieldReaderRichText extends YAMLTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): StaticRichTextField {
    const field = StaticRichTextField.buildEmptyWithNullValues();
    field.content = ReaderUtil.getString(fieldSourceObject, YamlKeys.content);
    return field;
  }
}
