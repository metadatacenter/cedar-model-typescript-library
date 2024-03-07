import { Node } from '../../../util/types/Node';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { ReaderUtil } from '../../../../../reader/ReaderUtil';
import { CedarModel } from '../../../CedarModel';
import { CedarStaticImageField } from './CedarStaticImageField';

export class JSONFieldReaderImage {
  static read(fieldSourceObject: Node, parsingResult: ParsingResult, path: CedarJsonPath): CedarStaticImageField {
    const field = CedarStaticImageField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    field.content = ReaderUtil.getString(uiNode, CedarModel.content);
    return field;
  }
}
