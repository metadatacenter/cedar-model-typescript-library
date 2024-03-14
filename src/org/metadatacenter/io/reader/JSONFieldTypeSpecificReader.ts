import { JsonNode } from '../../model/cedar/types/basic-types/JsonNode';
import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { CedarJsonPath } from '../../model/cedar/util/path/CedarJsonPath';
import { CedarField } from '../../model/cedar/field/CedarField';
import { CedarUnknownField } from '../../model/cedar/field/CedarUnknownField';
import { CedarContainerChildInfo } from '../../model/cedar/types/beans/CedarContainerChildInfo';

export abstract class JSONFieldTypeSpecificReader {
  public read(
    _fieldSourceObject: JsonNode,
    _childInfo: CedarContainerChildInfo,
    _parsingResult: ParsingResult,
    _path: CedarJsonPath,
  ): CedarField {
    return CedarUnknownField.build();
  }
}
