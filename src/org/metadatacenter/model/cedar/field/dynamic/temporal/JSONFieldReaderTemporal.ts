import { JsonNode } from '../../../util/types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { ReaderUtil } from '../../../../../reader/ReaderUtil';
import { CedarModel } from '../../../CedarModel';
import { CedarTemporalField } from './CedarTemporalField';
import { ValueConstraintsTemporalField } from './ValueConstraintsTemporalField';
import { TemporalType } from '../../../beans/TemporalType';

export class JSONFieldReaderTemporal {
  static read(fieldSourceObject: JsonNode, parsingResult: ParsingResult, path: CedarJsonPath): CedarTemporalField {
    const field = CedarTemporalField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    if (uiNode != null) {
      field.temporalGranularity = ReaderUtil.getString(uiNode, CedarModel.temporalGranularity);
      field.inputTimeFormat = ReaderUtil.getString(uiNode, CedarModel.inputTimeFormat);
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
