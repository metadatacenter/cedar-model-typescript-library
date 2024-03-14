import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JSONTemplateFieldContentDynamic } from '../../../util/serialization/JSONTemplateFieldContentDynamic';
import { JsonSchema } from '../../../constants/JsonSchema';
import { JSONFieldWriterInternal } from '../../../../../io/writer/JSONFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { CedarModel } from '../../../constants/CedarModel';
import { NumericField } from './NumericField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';

export class JSONFieldWriterNumeric extends JSONFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandPropertiesNodeForJSON(propertiesObject: JsonNode): void {
    propertiesObject[JsonSchema.properties] = JSONTemplateFieldContentDynamic.PROPERTIES_VERBATIM_NUMERIC;
  }

  override expandRequiredNodeForJSON(requiredObject: JsonNode): void {
    requiredObject[JsonSchema.required] = [JsonSchema.atValue, JsonSchema.atType];
  }

  override expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: NumericField, childInfo: ChildDeploymentInfo): void {
    super.expandValueConstraintsNodeForJSON(vcNode, field, childInfo);
    vcNode[CedarModel.numberType] = this.atomicWriter.write(field.valueConstraints.numberType);
    if (field.valueConstraints.minValue != null) {
      vcNode[CedarModel.minValue] = field.valueConstraints.minValue;
    }
    if (field.valueConstraints.maxValue != null) {
      vcNode[CedarModel.maxValue] = field.valueConstraints.maxValue;
    }
    if (field.valueConstraints.decimalPlace != null) {
      vcNode[CedarModel.decimalPlace] = field.valueConstraints.decimalPlace;
    }
    if (field.valueConstraints.unitOfMeasure != null) {
      vcNode[CedarModel.unitOfMeasure] = field.valueConstraints.unitOfMeasure;
    }
  }
}
