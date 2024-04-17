import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { MultipleChoiceListField } from './MultipleChoiceListField';
import { MultipleChoiceListFieldImpl } from './MultipleChoiceListFieldImpl';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';

export class YamlFieldReaderMultiSelectList extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): MultipleChoiceListField {
    const field = MultipleChoiceListFieldImpl.buildEmpty();
    YamlTemplateFieldTypeSpecificReader.readAndStoreListOptions(fieldSourceObject, field);
    return field;
  }
}
