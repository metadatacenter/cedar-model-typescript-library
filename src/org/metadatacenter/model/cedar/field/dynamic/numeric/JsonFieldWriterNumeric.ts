import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonTemplateFieldContentDynamic } from '../../../util/serialization/JsonTemplateFieldContentDynamic';
import { JsonSchema } from '../../../constants/JsonSchema';
import { JsonTemplateFieldWriterInternal } from '../../../../../io/writer/json/JsonTemplateFieldWriterInternal';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { CedarModel } from '../../../constants/CedarModel';
import { NumericField } from './NumericField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';
import { NumericDefaultValueValidator } from './NumericDefaultValueValidator';

export class JsonFieldWriterNumeric extends JsonTemplateFieldWriterInternal {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  override expandPropertiesNode(propertiesObject: JsonNode): void {
    propertiesObject[JsonSchema.properties] = JsonTemplateFieldContentDynamic.PROPERTIES_VERBATIM_LITERAL;
  }

  override expandRequiredNode(requiredObject: JsonNode): void {
    requiredObject[JsonSchema.required] = [JsonSchema.atValue, JsonSchema.atType];
  }

  override expandValueConstraintsNode(vcNode: JsonNode, field: NumericField, childInfo: ChildDeploymentInfo): void {
    NumericDefaultValueValidator.assertValid(
      field.valueConstraints.numberType,
      field.valueConstraints.defaultValue,
      field.valueConstraints.minValue,
      field.valueConstraints.maxValue,
    );
    vcNode[CedarModel.numberType] = this.atomicWriter.write(field.valueConstraints.numberType);
    if (field.valueConstraints.minValue != null) {
      vcNode[CedarModel.minValue] = field.valueConstraints.minValue;
    }
    if (field.valueConstraints.maxValue != null) {
      vcNode[CedarModel.maxValue] = field.valueConstraints.maxValue;
    }
    if (field.valueConstraints.decimalPlaces != null) {
      vcNode[CedarModel.decimalPlace] = field.valueConstraints.decimalPlaces;
    }
    if (field.valueConstraints.unitOfMeasure != null) {
      vcNode[CedarModel.unitOfMeasure] = field.valueConstraints.unitOfMeasure;
    }
    if (field.valueConstraints.defaultValue != null) {
      // The CEDAR JSON schema permits a string or URI/label object here, not a
      // bare number. Match the Java artifact library's canonical encoding.
      vcNode[CedarModel.defaultValue] = String(field.valueConstraints.defaultValue);
    }
    super.expandValueConstraintsNode(vcNode, field, childInfo);
  }
}
