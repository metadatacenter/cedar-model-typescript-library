import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { LinkField } from './LinkField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { LinkFieldImpl } from './LinkFieldImpl';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';
import { YamlKeys } from '../../../constants/YamlKeys';
import { DefaultValueSerialization } from '../../DefaultValueSerialization';

export class YamlFieldReaderLink extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): LinkField {
    const field = LinkFieldImpl.buildEmpty();
    field.valueConstraints.defaultValue = DefaultValueSerialization.iriFromNode(fieldSourceObject, YamlKeys.default);
    return field;
  }
}
