import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { StaticRichTextField } from './StaticRichTextField';
import { JSONTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JSONTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';

export class JSONFieldReaderRichText extends JSONTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): StaticRichTextField {
    const field = StaticRichTextField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    field.content = ReaderUtil.getString(uiNode, CedarModel.content);
    return field;
  }
}
