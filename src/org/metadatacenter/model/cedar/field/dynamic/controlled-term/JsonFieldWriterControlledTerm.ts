import { JsonNode } from '../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../constants/CedarModel';
import { ControlledTermField } from './ControlledTermField';
import { JsonTemplateFieldWriterInternal } from '../../../../../io/writer/json/JsonTemplateFieldWriterInternal';
import { JsonWriterBehavior } from '../../../../../behavior/JsonWriterBehavior';
import { JsonSchema } from '../../../constants/JsonSchema';
import { JsonTemplateFieldContentDynamic } from '../../../util/serialization/JsonTemplateFieldContentDynamic';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { CedarJsonWriters } from '../../../../../io/writer/json/CedarJsonWriters';

export class JsonFieldWriterControlledTerm extends JsonTemplateFieldWriterInternal {
  constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  override expandPropertiesNode(propertiesObject: JsonNode): void {
    if (this.behavior.includeSkosNotationForLinksAndControlled()) {
      propertiesObject[JsonSchema.properties] = JsonTemplateFieldContentDynamic.PROPERTIES_VERBATIM_IRI;
    } else {
      propertiesObject[JsonSchema.properties] = JsonTemplateFieldContentDynamic.PROPERTIES_VERBATIM_IRI_NO_SKOS_NOTATION;
    }
  }

  override expandUINode(uiNode: JsonNode, field: ControlledTermField, childInfo: ChildDeploymentInfo): void {
    super.expandUINode(uiNode, field, childInfo);
    if (field.valueRecommendationEnabled) {
      uiNode[CedarModel.valueRecommendationEnabled] = field.valueRecommendationEnabled;
    }
  }

  override expandRequiredNode(_requiredObject: JsonNode): void {
    // TODO: Should the @id be required in case of a controlled term? or @value?
  }

  override expandValueConstraintsNode(vcNode: JsonNode, field: ControlledTermField, childInfo: ChildDeploymentInfo): void {
    const ontologiesList: Array<JsonNode> = JsonNode.getEmptyList();
    field.valueConstraints.ontologies.forEach((ontology) => {
      ontologiesList.push(this.writers.getWriterForValueConstraint(ontology).getAsJsonNode(ontology));
    });
    vcNode[CedarModel.ontologies] = ontologiesList;

    const valueSetList: Array<JsonNode> = JsonNode.getEmptyList();
    field.valueConstraints.valueSets.forEach((clazz) => {
      valueSetList.push(this.writers.getWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    vcNode[CedarModel.valueSets] = valueSetList;

    const classesList: Array<JsonNode> = JsonNode.getEmptyList();
    field.valueConstraints.classes.forEach((clazz) => {
      classesList.push(this.writers.getWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    vcNode[CedarModel.classes] = classesList;

    const branchesList: Array<JsonNode> = JsonNode.getEmptyList();
    field.valueConstraints.branches.forEach((clazz) => {
      branchesList.push(this.writers.getWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    vcNode[CedarModel.branches] = branchesList;

    const actionsList: Array<JsonNode> = JsonNode.getEmptyList();
    field.valueConstraints.actions.forEach((clazz) => {
      actionsList.push(this.writers.getWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    if (actionsList.length > 0) {
      vcNode[CedarModel.actions] = actionsList;
    }

    if (field.valueConstraints.defaultValue != null) {
      const defaultValue = JsonNode.getEmpty();
      defaultValue[JsonSchema.rdfsLabel] = field.valueConstraints.defaultValue.rdfsLabel;
      defaultValue[JsonSchema.termUri] = this.atomicWriter.write(field.valueConstraints.defaultValue.termUri);
      vcNode[CedarModel.defaultValue] = defaultValue;
    }

    // TODO: this should be not in the model
    // TODO: clarify why was this here then
    // vcNode[CedarModel.multipleChoice] = false;
    super.expandValueConstraintsNode(vcNode, field, childInfo);
  }
}
