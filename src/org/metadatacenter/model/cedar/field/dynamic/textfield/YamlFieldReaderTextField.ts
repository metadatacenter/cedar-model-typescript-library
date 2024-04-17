import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { TextField } from './TextField';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';
import { TextFieldImpl } from './TextFieldImpl';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';

export class YamlFieldReaderTextField extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): TextField {
    const field = TextFieldImpl.buildEmpty();

    field.valueRecommendationEnabled = ReaderUtil.getBoolean(fieldSourceObject, YamlKeys.valueRecommendationEnabled);

    field.valueConstraints.defaultValue = ReaderUtil.getString(fieldSourceObject, YamlKeys.default);
    field.valueConstraints.minLength = ReaderUtil.getNumber(fieldSourceObject, YamlKeys.minLength);
    field.valueConstraints.maxLength = ReaderUtil.getNumber(fieldSourceObject, YamlKeys.maxLength);
    field.valueConstraints.regex = ReaderUtil.getString(fieldSourceObject, YamlKeys.regex);
    return field;
  }
}
