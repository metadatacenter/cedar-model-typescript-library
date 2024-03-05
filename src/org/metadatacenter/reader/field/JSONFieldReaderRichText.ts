import { Node } from '../../model/cedar/util/types/Node';
import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { CedarJsonPath } from '../../model/cedar/util/path/CedarJsonPath';
import { ReaderUtil } from '../ReaderUtil';
import { CedarModel } from '../../model/cedar/CedarModel';
import { CedarStaticRichTextField } from '../../model/cedar/field/static-rich-text/CedarStaticRichTextField';

export class JSONFieldReaderRichText {
  static read(fieldSourceObject: Node, parsingResult: ParsingResult, path: CedarJsonPath): CedarStaticRichTextField {
    const field = CedarStaticRichTextField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    field.content = ReaderUtil.getString(uiNode, CedarModel.content);
    return field;
  }
}
