import { Node } from '../../../util/types/Node';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { ReaderUtil } from '../../../../../reader/ReaderUtil';
import { CedarModel } from '../../../CedarModel';
import { CedarStaticSectionBreakField } from './CedarStaticSectionBreakField';

export class JSONFieldReaderSectionBreak {
  static read(fieldSourceObject: Node, parsingResult: ParsingResult, path: CedarJsonPath): CedarStaticSectionBreakField {
    const field = CedarStaticSectionBreakField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    return field;
  }
}
