import { Node } from '../../model/cedar/util/types/Node';
import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { CedarJsonPath } from '../../model/cedar/util/path/CedarJsonPath';
import { ReaderUtil } from '../ReaderUtil';
import { CedarModel } from '../../model/cedar/CedarModel';
import { CedarStaticImageField } from '../../model/cedar/field/CedarStaticImageField';

export class JSONFieldReaderImage {
  static read(fieldSourceObject: Node, parsingResult: ParsingResult, path: CedarJsonPath): CedarStaticImageField {
    const field = CedarStaticImageField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    field.content = ReaderUtil.getString(uiNode, CedarModel.content);
    return field;
  }
}
