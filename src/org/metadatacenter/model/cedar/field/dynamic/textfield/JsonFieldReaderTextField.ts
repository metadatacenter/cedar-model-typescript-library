import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { TextField } from './TextField';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { JsonTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JsonTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { TextFieldImpl } from './TextFieldImpl';

export class JsonFieldReaderTextField extends JsonTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    _parsingResult: JsonArtifactParsingResult,
    _path: JsonPath,
  ): TextField {
    const field = TextFieldImpl.buildEmpty();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);

    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      field.valueConstraints.defaultValue = ReaderUtil.getString(valueConstraints, CedarModel.defaultValue);
      field.valueConstraints.minLength = ReaderUtil.getNumber(valueConstraints, CedarModel.minLength);
      field.valueConstraints.maxLength = ReaderUtil.getNumber(valueConstraints, CedarModel.maxLength);
      field.valueConstraints.regex = ReaderUtil.getString(valueConstraints, CedarModel.regex);
    }
    return field;
  }
}
