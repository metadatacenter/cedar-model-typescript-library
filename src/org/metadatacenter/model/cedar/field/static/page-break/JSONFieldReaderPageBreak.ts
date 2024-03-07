import { Node } from '../../../util/types/Node';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { ReaderUtil } from '../../../../../reader/ReaderUtil';
import { CedarModel } from '../../../CedarModel';
import { CedarStaticPageBreakField } from './CedarStaticPageBreakField';

export class JSONFieldReaderPageBreak {
  static read(fieldSourceObject: Node, parsingResult: ParsingResult, path: CedarJsonPath): CedarStaticPageBreakField {
    const field = CedarStaticPageBreakField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    return field;
  }
}
