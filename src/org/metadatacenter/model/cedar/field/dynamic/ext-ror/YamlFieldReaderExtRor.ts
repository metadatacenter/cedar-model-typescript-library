import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';
import { ExtRorField } from './ExtRorField';
import { ExtRorFieldImpl } from './ExtRorFieldImpl';
import { YamlKeys } from '../../../constants/YamlKeys';
import { DefaultValueSerialization } from '../../DefaultValueSerialization';

export class YamlFieldReaderExtRor extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): ExtRorField {
    const field = ExtRorFieldImpl.buildEmpty();
    field.valueConstraints.defaultValue = DefaultValueSerialization.iriFromNode(fieldSourceObject, YamlKeys.default);
    return field;
  }
}
