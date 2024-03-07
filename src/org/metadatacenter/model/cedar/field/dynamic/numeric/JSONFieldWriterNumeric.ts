import { JsonNode } from '../../../util/types/JsonNode';
import { CedarTemplateFieldContent } from '../../../util/serialization/CedarTemplateFieldContent';
import { JsonSchema } from '../../../constants/JsonSchema';
import { JSONFieldWriter } from '../../JSONFieldWriter';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { CedarModel } from '../../../CedarModel';
import { CedarNumericField } from './CedarNumericField';

export class JSONFieldWriterNumeric extends JSONFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandPropertiesNodeForJSON(propertiesObject: JsonNode): void {
    propertiesObject[JsonSchema.properties] = CedarTemplateFieldContent.PROPERTIES_VERBATIM_NUMERIC;
  }

  override expandRequiredNodeForJSON(requiredObject: JsonNode): void {
    requiredObject[JsonSchema.required] = [JsonSchema.atValue, JsonSchema.atType];
  }

  override expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: CedarNumericField): void {
    super.expandValueConstraintsNodeForJSON(vcNode, field);
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
