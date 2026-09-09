import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';
import { ExtOrcidField } from './ExtOrcidField';
import { ExtOrcidFieldImpl } from './ExtOrcidFieldImpl';
import { YamlKeys } from '../../../constants/YamlKeys';
import { DefaultValueSerialization } from '../../DefaultValueSerialization';

export class YamlFieldReaderExtOrcid extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): ExtOrcidField {
    const field = ExtOrcidFieldImpl.buildEmpty();
    field.valueConstraints.defaultValue = DefaultValueSerialization.iriFromNode(fieldSourceObject, YamlKeys.default);
    return field;
  }
}
