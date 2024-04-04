import { JsonNode } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { ControlledTermField } from './ControlledTermField';
import { JSONTemplateFieldWriterInternal } from '../../../../../io/writer/json/JSONTemplateFieldWriterInternal';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { JsonSchema } from '../../../constants/JsonSchema';
import { JSONTemplateFieldContentDynamic } from '../../../util/serialization/JSONTemplateFieldContentDynamic';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { CedarJSONWriters } from '../../../../../io/writer/json/CedarJSONWriters';

export class JSONFieldWriterControlledTerm extends JSONTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarJSONWriters) {
    super(behavior, writers);
  }

  override expandPropertiesNodeForJSON(propertiesObject: JsonNode): void {
    if (this.behavior.includeSkosNotationForLinksAndControlled()) {
      propertiesObject[JsonSchema.properties] = JSONTemplateFieldContentDynamic.PROPERTIES_VERBATIM_CONTROLLED;
    } else {
      propertiesObject[JsonSchema.properties] = JSONTemplateFieldContentDynamic.PROPERTIES_VERBATIM_CONTROLLED_NO_SKOS_NOTATION;
    }
  }

  override expandUINodeForJSON(uiNode: JsonNode, field: ControlledTermField, childInfo: ChildDeploymentInfo): void {
    super.expandUINodeForJSON(uiNode, field, childInfo);
    if (field.valueRecommendationEnabled) {
      uiNode[CedarModel.valueRecommendationEnabled] = field.valueRecommendationEnabled;
    }
  }

  override expandRequiredNodeForJSON(_requiredObject: JsonNode): void {
    // TODO: Should the @id be required in case of a controlled term? or @value?
  }

  override expandValueConstraintsNodeForJSON(vcNode: JsonNode, field: ControlledTermField, childInfo: ChildDeploymentInfo): void {
    super.expandValueConstraintsNodeForJSON(vcNode, field, childInfo);
    if (field.valueConstraints.defaultValue != null) {
      const defaultValue = JsonNode.getEmpty();
      defaultValue[JsonSchema.termUri] = this.atomicWriter.write(field.valueConstraints.defaultValue.termUri);
      defaultValue[JsonSchema.rdfsLabel] = field.valueConstraints.defaultValue.rdfsLabel;
      vcNode[CedarModel.defaultValue] = defaultValue;
    }

    const ontologiesList: Array<JsonNode> = JsonNode.getEmptyList();
    field.valueConstraints.ontologies.forEach((ontology) => {
      ontologiesList.push(this.writers.getJSONWriterForValueConstraint(ontology).getAsJsonNode(ontology));
    });
    vcNode[CedarModel.ontologies] = ontologiesList;

    const classesList: Array<JsonNode> = JsonNode.getEmptyList();
    field.valueConstraints.classes.forEach((clazz) => {
      classesList.push(this.writers.getJSONWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    vcNode[CedarModel.classes] = classesList;

    const branchesList: Array<JsonNode> = JsonNode.getEmptyList();
    field.valueConstraints.branches.forEach((clazz) => {
      branchesList.push(this.writers.getJSONWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    vcNode[CedarModel.branches] = branchesList;

    const valueSetList: Array<JsonNode> = JsonNode.getEmptyList();
    field.valueConstraints.valueSets.forEach((clazz) => {
      valueSetList.push(this.writers.getJSONWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    vcNode[CedarModel.valueSets] = valueSetList;

    const actionsList: Array<JsonNode> = JsonNode.getEmptyList();
    field.valueConstraints.actions.forEach((clazz) => {
      actionsList.push(this.writers.getJSONWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    if (actionsList.length > 0) {
      vcNode[CedarModel.actions] = actionsList;
    }

    // TODO: this should be not in the model
    vcNode[CedarModel.multipleChoice] = false;
  }
}
