import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { NumericField } from './NumericField';
import { NumberType } from '../../../types/wrapped-types/NumberType';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';
import { NumericFieldImpl } from './NumericFieldImpl';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';
import { NumericDefaultValueValidator } from './NumericDefaultValueValidator';

export class YamlFieldReaderNumeric extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): NumericField {
    const field = NumericFieldImpl.buildEmpty();

    // Only override the type when the YAML states one, so an unspecified datatype
    // keeps the empty field's default of xsd:decimal. This matches
    // JsonFieldReaderNumeric, which guards the same assignment, and the Java
    // library, whose JSON and YAML readers both default a missing numeric type to
    // xsd:decimal. Assigning unconditionally clobbered that default with null on
    // the YAML side, so the same numeric field read as JSON and as YAML disagreed.
    const datatype = ReaderUtil.getString(fieldSourceObject, YamlKeys.datatype);
    if (datatype !== null) {
      field.valueConstraints.numberType = NumberType.forValue(datatype);
    }
    field.valueConstraints.minValue = ReaderUtil.getNumber(fieldSourceObject, YamlKeys.minValue);
    field.valueConstraints.maxValue = ReaderUtil.getNumber(fieldSourceObject, YamlKeys.maxValue);
    field.valueConstraints.decimalPlaces = ReaderUtil.getNumber(fieldSourceObject, YamlKeys.decimalPlaces);
    field.valueConstraints.unitOfMeasure = ReaderUtil.getString(fieldSourceObject, YamlKeys.unit);
    field.valueConstraints.defaultValue = ReaderUtil.getNumericDefault(fieldSourceObject, YamlKeys.default);
    NumericDefaultValueValidator.assertValid(
      field.valueConstraints.numberType,
      field.valueConstraints.defaultValue,
      field.valueConstraints.minValue,
      field.valueConstraints.maxValue,
    );
    return field;
  }
}
