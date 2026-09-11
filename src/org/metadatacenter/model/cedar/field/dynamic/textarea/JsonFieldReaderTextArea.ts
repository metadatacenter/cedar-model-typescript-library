import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { TextArea } from './TextArea';
import { JsonTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JsonTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { TextAreaImpl } from './TextAreaImpl';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { DefaultValueSerialization } from '../../DefaultValueSerialization';

export class JsonFieldReaderTextArea extends JsonTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    _parsingResult: JsonArtifactParsingResult,
    _path: JsonPath,
  ): TextArea {
    const field = TextAreaImpl.buildEmpty();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);

    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      field.valueConstraints.defaultValue = DefaultValueSerialization.literalFromNode(valueConstraints, CedarModel.defaultValue);
    }

    return field;
  }
}
