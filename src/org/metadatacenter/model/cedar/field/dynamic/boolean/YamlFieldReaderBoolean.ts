import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';
import { BooleanField } from './BooleanField';
import { BooleanFieldImpl } from './BooleanFieldImpl';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';

export class YamlFieldReaderBoolean extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): BooleanField {
    const field = BooleanFieldImpl.buildEmpty();

    field.valueConstraints.defaultValue = ReaderUtil.getBooleanOrNullOrUndefined(fieldSourceObject, YamlKeys.default);
    field.valueConstraints.nullEnabled = ReaderUtil.getBooleanOrNull(fieldSourceObject, YamlKeys.nullEnabled);
    const labels: JsonNode = ReaderUtil.getNode(fieldSourceObject, YamlKeys.labels);
    if (labels !== null) {
      field.valueConstraints.trueLabel = ReaderUtil.getString(labels, YamlKeys.trueLabel);
      field.valueConstraints.falseLabel = ReaderUtil.getString(labels, YamlKeys.falseLabel);
      field.valueConstraints.nullLabel = ReaderUtil.getString(labels, YamlKeys.nullLabel);
    }

    return field;
  }
}
