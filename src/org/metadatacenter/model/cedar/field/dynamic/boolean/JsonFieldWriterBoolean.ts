import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonTemplateFieldContentDynamic } from '../../../util/serialization/JsonTemplateFieldContentDynamic';
import { JsonSchema } from '../../../constants/JsonSchema';
import { JsonTemplateFieldWriterInternal } from '../../../../../io/writer/json/JsonTemplateFieldWriterInternal';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { CedarModel } from '../../../constants/CedarModel';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';
import { BooleanField } from './BooleanField';

export class JsonFieldWriterBoolean extends JsonTemplateFieldWriterInternal {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  override expandPropertiesNode(propertiesObject: JsonNode): void {
    propertiesObject[JsonSchema.properties] = JsonTemplateFieldContentDynamic.PROPERTIES_VERBATIM_BOOLEAN;
  }

  override expandValueConstraintsNode(vcNode: JsonNode, field: BooleanField, childInfo: ChildDeploymentInfo): void {
    super.expandValueConstraintsNode(vcNode, field, childInfo);
    if (field.valueConstraints.nullEnabled !== null) {
      vcNode[CedarModel.nullEnabled] = field.valueConstraints.nullEnabled;
    }
    if (field.valueConstraints.defaultValue !== undefined) {
      vcNode[CedarModel.defaultValue] = field.valueConstraints.defaultValue;
    }
    const labels: JsonNode = JsonNode.getEmpty();
    if (field.valueConstraints.trueLabel !== null) {
      labels[CedarModel.trueLabel] = field.valueConstraints.trueLabel;
    }
    if (field.valueConstraints.falseLabel !== null) {
      labels[CedarModel.falseLabel] = field.valueConstraints.falseLabel;
    }
    if (field.valueConstraints.nullLabel !== null) {
      labels[CedarModel.nullLabel] = field.valueConstraints.nullLabel;
    }
    vcNode[CedarModel.labels] = labels;
  }
}
