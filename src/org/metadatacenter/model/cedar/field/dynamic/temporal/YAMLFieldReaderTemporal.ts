import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { TemporalField } from './TemporalField';
import { TemporalType } from '../../../types/wrapped-types/TemporalType';
import { TimeFormat } from '../../../types/wrapped-types/TimeFormat';
import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YAMLFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';

export class YAMLFieldReaderTemporal extends YAMLFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): TemporalField {
    const field = TemporalField.buildEmptyWithNullValues();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);

    field.temporalGranularity = TemporalGranularity.forValue(ReaderUtil.getString(fieldSourceObject, YamlKeys.granularity));
    field.inputTimeFormat = TimeFormat.forValue(ReaderUtil.getString(fieldSourceObject, YamlKeys.timeFormat));
    field.timezoneEnabled = ReaderUtil.getBoolean(fieldSourceObject, YamlKeys.timeZone);

    field.valueConstraints.temporalType = TemporalType.forValue(ReaderUtil.getString(fieldSourceObject, YamlKeys.datatype));
    return field;
  }
}
