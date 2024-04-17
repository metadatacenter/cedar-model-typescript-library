import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { TemporalField } from './TemporalField';
import { TemporalType } from '../../../types/wrapped-types/TemporalType';
import { TimeFormat } from '../../../types/wrapped-types/TimeFormat';
import { TemporalGranularity } from '../../../types/wrapped-types/TemporalGranularity';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';
import { TemporalFieldImpl } from './TemporalFieldImpl';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';

export class YamlFieldReaderTemporal extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): TemporalField {
    const field = TemporalFieldImpl.buildEmpty();

    field.temporalGranularity = TemporalGranularity.forValue(ReaderUtil.getString(fieldSourceObject, YamlKeys.granularity));
    field.inputTimeFormat = TimeFormat.forValue(ReaderUtil.getString(fieldSourceObject, YamlKeys.timeFormat));
    field.timezoneEnabled = ReaderUtil.getBoolean(fieldSourceObject, YamlKeys.timeZone);

    field.valueConstraints.temporalType = TemporalType.forValue(ReaderUtil.getString(fieldSourceObject, YamlKeys.datatype));
    return field;
  }
}
