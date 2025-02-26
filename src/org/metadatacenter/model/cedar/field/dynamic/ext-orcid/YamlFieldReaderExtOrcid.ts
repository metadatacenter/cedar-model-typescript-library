import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';
import { ExtOrcidField } from './ExtOrcidField';
import { ExtOrcidFieldImpl } from './ExtOrcidFieldImpl';

export class YamlFieldReaderExtOrcid extends YamlTemplateFieldTypeSpecificReader {
  override read(
    _fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): ExtOrcidField {
    return ExtOrcidFieldImpl.buildEmpty();
  }
}
