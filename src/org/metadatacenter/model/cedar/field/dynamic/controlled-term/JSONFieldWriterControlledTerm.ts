import { JsonNode, JsonNodeClass } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { CedarControlledTermField } from './CedarControlledTermField';
import { JSONFieldWriterInternal } from '../../../../../io/writer/JSONFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { JsonSchema } from '../../../constants/JsonSchema';
import { CedarJSONTemplateFieldContentDynamic } from '../../../util/serialization/CedarJSONTemplateFieldContentDynamic';
import { CedarContainerChildInfo } from '../../../types/beans/CedarContainerChildInfo';

export class JSONFieldWriterControlledTerm extends JSONFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandPropertiesNodeForJSON(propertiesObject: JsonNode): void {
    propertiesObject[JsonSchema.properties] = CedarJSONTemplateFieldContentDynamic.PROPERTIES_VERBATIM_CONTROLLED;
  }

  override expandUINodeForJSON(uiNode: JsonNode, field: CedarControlledTermField, childInfo: CedarContainerChildInfo): void {
    super.expandUINodeForJSON(uiNode, field, childInfo);
    if (field.valueRecommendationEnabled) {
      uiNode[CedarModel.valueRecommendationEnabled] = field.valueRecommendationEnabled;
    }
  }

  override expandRequiredNodeForJSON(_requiredObject: JsonNode): void {
    // TODO: Should the @id be required in case of a controlled term? or @value?
  }

  override expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: CedarControlledTermField, childInfo: CedarContainerChildInfo): void {
    super.expandValueConstraintsNodeForJSON(vcNode, field, childInfo);
    if (field.valueConstraints.defaultValue != null) {
      const defaultValue = JsonNodeClass.getEmpty();
      defaultValue[JsonSchema.termUri] = this.atomicWriter.write(field.valueConstraints.defaultValue.termUri);
      defaultValue[JsonSchema.rdfsLabel] = field.valueConstraints.defaultValue.rdfsLabel;
      vcNode[CedarModel.defaultValue] = defaultValue;
    }

    const ontologiesList: Array<JsonNode> = JsonNodeClass.getEmptyList();
    field.valueConstraints.ontologies.forEach((ontology) => {
      ontologiesList.push(this.writers.getJSONWriterForValueConstraint(ontology).getAsJsonNode(ontology));
    });
    vcNode[CedarModel.ontologies] = ontologiesList;

    const classesList: Array<JsonNode> = JsonNodeClass.getEmptyList();
    field.valueConstraints.classes.forEach((clazz) => {
      classesList.push(this.writers.getJSONWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    vcNode[CedarModel.classes] = classesList;

    const branchesList: Array<JsonNode> = JsonNodeClass.getEmptyList();
    field.valueConstraints.branches.forEach((clazz) => {
      branchesList.push(this.writers.getJSONWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    vcNode[CedarModel.branches] = branchesList;

    const valueSetList: Array<JsonNode> = JsonNodeClass.getEmptyList();
    field.valueConstraints.valueSets.forEach((clazz) => {
      valueSetList.push(this.writers.getJSONWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    vcNode[CedarModel.valueSets] = valueSetList;

    // TODO: this should be not in the model
    vcNode[CedarModel.multipleChoice] = false;
  }
}
