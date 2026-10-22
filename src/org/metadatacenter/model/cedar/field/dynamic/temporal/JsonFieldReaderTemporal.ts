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
import { TemporalDefaultValueValidator } from './TemporalDefaultValueValidator';

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
      const granularity = ReaderUtil.getString(uiNode, CedarModel.temporalGranularity);
      if (granularity !== null) {
        field.temporalGranularity = TemporalGranularity.forGranularity(granularity);
      }
      const inputTimeFormat = ReaderUtil.getString(uiNode, CedarModel.inputTimeFormat);
      if (inputTimeFormat !== null) {
        field.inputTimeFormat = TimeFormat.forInputTimeFormat(inputTimeFormat);
      }
      field.timezoneEnabled = ReaderUtil.getBoolean(uiNode, CedarModel.timezoneEnabled);
    }

    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      const temporalType = ReaderUtil.getString(valueConstraints, CedarModel.temporalType);
      if (temporalType !== null) {
        field.valueConstraints.temporalType = TemporalType.forDatatype(temporalType);
      }
      field.valueConstraints.defaultValue = ReaderUtil.getString(valueConstraints, CedarModel.defaultValue);
      TemporalDefaultValueValidator.assertValid(
        field.valueConstraints.temporalType,
        field.temporalGranularity,
        field.valueConstraints.defaultValue,
      );
    }
    return field;
  }
}
