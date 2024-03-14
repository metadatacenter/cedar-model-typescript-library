import { JsonNode } from '../../../types/basic-types/JsonNode';
import { CedarJSONTemplateFieldContentDynamic } from '../../../util/serialization/CedarJSONTemplateFieldContentDynamic';
import { JsonSchema } from '../../../constants/JsonSchema';
import { JSONFieldWriter } from '../../../../../io/writer/JSONFieldWriter';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { CedarModel } from '../../../constants/CedarModel';
import { CedarNumericField } from './CedarNumericField';
import { CedarContainerChildInfo } from '../../../types/beans/CedarContainerChildInfo';

export class JSONFieldWriterNumeric extends JSONFieldWriter {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandPropertiesNodeForJSON(propertiesObject: JsonNode): void {
    propertiesObject[JsonSchema.properties] = CedarJSONTemplateFieldContentDynamic.PROPERTIES_VERBATIM_NUMERIC;
  }

  override expandRequiredNodeForJSON(requiredObject: JsonNode): void {
    requiredObject[JsonSchema.required] = [JsonSchema.atValue, JsonSchema.atType];
  }

  override expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: CedarNumericField, childInfo: CedarContainerChildInfo): void {
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
