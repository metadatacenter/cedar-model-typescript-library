import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { TemporalField } from './TemporalField';
import { TemporalType } from '../../../types/wrapped-types/TemporalType';
import { TimeFormat } from '../../../types/wrapped-types/TimeFormat';
import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YAMLTemplateFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';

export class YAMLFieldReaderTemporal extends YAMLTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): TemporalField {
    const field = TemporalField.buildEmptyWithNullValues();

    field.temporalGranularity = TemporalGranularity.forValue(ReaderUtil.getString(fieldSourceObject, YamlKeys.granularity));
    field.inputTimeFormat = TimeFormat.forValue(ReaderUtil.getString(fieldSourceObject, YamlKeys.timeFormat));
    field.timezoneEnabled = ReaderUtil.getBoolean(fieldSourceObject, YamlKeys.timeZone);

    field.valueConstraints.temporalType = TemporalType.forValue(ReaderUtil.getString(fieldSourceObject, YamlKeys.datatype));
    return field;
  }
}
