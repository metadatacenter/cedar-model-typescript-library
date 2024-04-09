import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { MultipleChoiceListField } from '../list-multiple-choice/MultipleChoiceListField';
import { MultipleChoiceListFieldImpl } from '../list-multiple-choice/MultipleChoiceListFieldImpl';

export class YamlFieldReaderMultiSelectList extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): MultipleChoiceListField {
    const field = MultipleChoiceListFieldImpl.buildEmpty();
    YamlTemplateFieldTypeSpecificReader.readAndStoreListOptions(fieldSourceObject, field);
    return field;
  }
}
