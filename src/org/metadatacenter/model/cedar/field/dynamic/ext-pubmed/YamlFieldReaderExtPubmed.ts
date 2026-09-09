import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';
import { ExtPubmedField } from './ExtPubmedField';
import { ExtPubmedFieldImpl } from './ExtPubmedFieldImpl';
import { YamlKeys } from '../../../constants/YamlKeys';
import { DefaultValueSerialization } from '../../DefaultValueSerialization';

export class YamlFieldReaderExtPubmed extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): ExtPubmedField {
    const field = ExtPubmedFieldImpl.buildEmpty();
    field.valueConstraints.defaultValue = DefaultValueSerialization.iriFromNode(fieldSourceObject, YamlKeys.default);
    return field;
  }
}
