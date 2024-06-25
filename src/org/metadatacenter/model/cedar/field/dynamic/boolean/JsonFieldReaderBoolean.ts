import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { JsonTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JsonTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { BooleanField } from './BooleanField';
import { BooleanFieldImpl } from './BooleanFieldImpl';

export class JsonFieldReaderBoolean extends JsonTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    _parsingResult: JsonArtifactParsingResult,
    _path: JsonPath,
  ): BooleanField {
    const field = BooleanFieldImpl.buildEmpty();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);

    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      field.valueConstraints.defaultValue = ReaderUtil.getBooleanOrNullOrUndefined(valueConstraints, CedarModel.defaultValue);
      field.valueConstraints.nullEnabled = ReaderUtil.getBooleanOrNull(valueConstraints, CedarModel.nullEnabled);
      const labels: JsonNode = ReaderUtil.getNode(valueConstraints, CedarModel.labels);
      if (labels != null) {
        field.valueConstraints.trueLabel = ReaderUtil.getString(labels, CedarModel.trueLabel);
        field.valueConstraints.falseLabel = ReaderUtil.getString(labels, CedarModel.falseLabel);
        field.valueConstraints.nullLabel = ReaderUtil.getString(labels, CedarModel.nullLabel);
      }
    }
    return field;
  }
}
