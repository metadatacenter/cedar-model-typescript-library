import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { TemporalField } from './TemporalField';
import { TemporalType } from '../../../types/wrapped-types/TemporalType';
import { TimeFormat } from '../../../types/wrapped-types/TimeFormat';
import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';
import { JSONTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JSONTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';

export class JSONFieldReaderTemporal extends JSONTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): TemporalField {
    const field = TemporalField.buildEmptyWithNullValues();
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
