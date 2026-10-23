import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { MultipleChoiceListField } from './MultipleChoiceListField';
import { MultipleChoiceListFieldImpl } from './MultipleChoiceListFieldImpl';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';
import { YamlFieldReaderControlledTerm } from '../controlled-term/YamlFieldReaderControlledTerm';

export class YamlFieldReaderMultiSelectList extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    path: JsonPath,
  ): MultipleChoiceListField {
    const field = MultipleChoiceListFieldImpl.buildEmpty();
    // An option states no type. Java reads an entry that states one as the constraint it names.
    YamlFieldReaderControlledTerm.readStatedConstraints(fieldSourceObject, path);
    YamlTemplateFieldTypeSpecificReader.readAndStoreListValueConstraints(fieldSourceObject, field);
    return field;
  }
}
