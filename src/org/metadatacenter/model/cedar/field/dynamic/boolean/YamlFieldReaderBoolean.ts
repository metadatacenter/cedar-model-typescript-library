import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';
import { BooleanField } from './BooleanField';
import { BooleanFieldImpl } from './BooleanFieldImpl';

export class YamlFieldReaderBoolean extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): BooleanField {
    const field = BooleanFieldImpl.buildEmpty();

    field.valueConstraints.defaultValue = ReaderUtil.getBooleanOrNullOrUndefined(fieldSourceObject, YamlKeys.default);
    field.valueConstraints.nullEnabled = ReaderUtil.getBooleanOrNull(fieldSourceObject, YamlKeys.nullEnabled);
    field.valueConstraints.trueLabel = ReaderUtil.getString(fieldSourceObject, YamlKeys.trueLabel);
    field.valueConstraints.falseLabel = ReaderUtil.getString(fieldSourceObject, YamlKeys.falseLabel);
    field.valueConstraints.nullLabel = ReaderUtil.getString(fieldSourceObject, YamlKeys.nullLabel);

    return field;
  }
}
