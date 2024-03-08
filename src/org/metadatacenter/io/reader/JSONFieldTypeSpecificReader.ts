import { JsonNode } from '../../model/cedar/util/types/JsonNode';
import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { CedarJsonPath } from '../../model/cedar/util/path/CedarJsonPath';
import { CedarField } from '../../model/cedar/field/CedarField';

export abstract class JSONFieldTypeSpecificReader {
  public read(fieldSourceObject: JsonNode, parsingResult: ParsingResult, path: CedarJsonPath): CedarField | null {
    return null;
  }
}
