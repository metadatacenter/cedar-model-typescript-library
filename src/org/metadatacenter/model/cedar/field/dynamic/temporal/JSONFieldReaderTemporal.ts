import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { CedarTemporalField } from './CedarTemporalField';
import { ValueConstraintsTemporalField } from './ValueConstraintsTemporalField';
import { TemporalType } from '../../../types/beans/TemporalType';
import { TimeFormat } from '../../../types/beans/TimeFormat';
import { TemporalGranularity } from '../../../types/beans/TemporalGranularity';
import { JSONFieldTypeSpecificReader } from '../../../../../io/reader/JSONFieldTypeSpecificReader';

export class JSONFieldReaderTemporal extends JSONFieldTypeSpecificReader {
  override read(fieldSourceObject: JsonNode, _parsingResult: ParsingResult, _path: CedarJsonPath): CedarTemporalField {
    const field = CedarTemporalField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    if (uiNode != null) {
      field.temporalGranularity = TemporalGranularity.forValue(ReaderUtil.getString(uiNode, CedarModel.temporalGranularity));
      field.inputTimeFormat = TimeFormat.forValue(ReaderUtil.getString(uiNode, CedarModel.inputTimeFormat));
      field.timezoneEnabled = ReaderUtil.getBoolean(uiNode, CedarModel.timezoneEnabled);
    }

    field.skos_altLabel = ReaderUtil.getStringList(fieldSourceObject, CedarModel.skosAltLabel);

    const vcTF = new ValueConstraintsTemporalField();
    field.valueConstraints = vcTF;
    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      vcTF.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
      vcTF.temporalType = TemporalType.forValue(ReaderUtil.getString(valueConstraints, CedarModel.temporalType));
    }
    return field;
  }
}
