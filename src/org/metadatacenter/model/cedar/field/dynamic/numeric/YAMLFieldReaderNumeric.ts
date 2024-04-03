import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { NumericField } from './NumericField';
import { NumberType } from '../../../types/wrapped-types/NumberType';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YAMLFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';

export class YAMLFieldReaderNumeric extends YAMLFieldTypeSpecificReader {
  override read(fieldSourceObject: JsonNode, childInfo: ChildDeploymentInfo, _parsingResult: ParsingResult, _path: JsonPath): NumericField {
    const field = NumericField.buildEmptyWithNullValues();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);

    field.valueConstraints.numberType = NumberType.forValue(ReaderUtil.getString(fieldSourceObject, YamlKeys.datatype));
    field.valueConstraints.minValue = ReaderUtil.getNumber(fieldSourceObject, YamlKeys.minValue);
    field.valueConstraints.maxValue = ReaderUtil.getNumber(fieldSourceObject, YamlKeys.maxValue);
    field.valueConstraints.decimalPlace = ReaderUtil.getNumber(fieldSourceObject, YamlKeys.decimalPlace);
    field.valueConstraints.unitOfMeasure = ReaderUtil.getString(fieldSourceObject, YamlKeys.unit);
    return field;
  }
}
