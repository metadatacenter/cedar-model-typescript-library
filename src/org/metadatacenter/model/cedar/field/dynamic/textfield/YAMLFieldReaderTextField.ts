import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { TextField } from './TextField';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YAMLFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';

export class YAMLFieldReaderTextField extends YAMLFieldTypeSpecificReader {
  override read(fieldSourceObject: JsonNode, _childInfo: ChildDeploymentInfo, _parsingResult: ParsingResult, _path: JsonPath): TextField {
    const field = TextField.buildEmptyWithNullValues();

    field.valueRecommendationEnabled = ReaderUtil.getBoolean(fieldSourceObject, YamlKeys.valueRecommendationEnabled);

    field.valueConstraints.defaultValue = ReaderUtil.getString(fieldSourceObject, YamlKeys.default);
    field.valueConstraints.minLength = ReaderUtil.getNumber(fieldSourceObject, YamlKeys.minLength);
    field.valueConstraints.maxLength = ReaderUtil.getNumber(fieldSourceObject, YamlKeys.maxLength);
    field.valueConstraints.regex = ReaderUtil.getString(fieldSourceObject, YamlKeys.regex);
    return field;
  }
}
