import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { SingleChoiceListFieldImpl } from './SingleChoiceListFieldImpl';
import { SingleChoiceListField } from './SingleChoiceListField';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';

export class YamlFieldReaderSingleSelectList extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): SingleChoiceListField {
    const field = SingleChoiceListFieldImpl.buildEmpty();
    YamlTemplateFieldTypeSpecificReader.readAndStoreListOptions(fieldSourceObject, field);
    return field;
  }
}
