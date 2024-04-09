import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { SingleChoiceListFieldImpl } from '../list-single-choice/SingleChoiceListFieldImpl';
import { SingleChoiceListField } from '../list-single-choice/SingleChoiceListField';

export class YamlFieldReaderSingleSelectList extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): SingleChoiceListField {
    const field = SingleChoiceListFieldImpl.buildEmpty();
    YamlTemplateFieldTypeSpecificReader.readAndStoreListOptions(fieldSourceObject, field);
    return field;
  }
}
