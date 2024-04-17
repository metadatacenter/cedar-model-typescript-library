import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { TemporalField } from './TemporalField';
import { TemporalType } from '../../../types/wrapped-types/TemporalType';
import { TimeFormat } from '../../../types/wrapped-types/TimeFormat';
import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';
import { JsonTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JsonTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { TemporalFieldImpl } from './TemporalFieldImpl';

export class JsonFieldReaderTemporal extends JsonTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    _parsingResult: JsonArtifactParsingResult,
    _path: JsonPath,
  ): TemporalField {
    const field = TemporalFieldImpl.buildEmpty();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);

    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    if (uiNode != null) {
      field.temporalGranularity = TemporalGranularity.forValue(ReaderUtil.getString(uiNode, CedarModel.temporalGranularity));
      field.inputTimeFormat = TimeFormat.forValue(ReaderUtil.getString(uiNode, CedarModel.inputTimeFormat));
      field.timezoneEnabled = ReaderUtil.getBoolean(uiNode, CedarModel.timezoneEnabled);
    }

    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      field.valueConstraints.temporalType = TemporalType.forValue(ReaderUtil.getString(valueConstraints, CedarModel.temporalType));
    }
    return field;
  }
}
