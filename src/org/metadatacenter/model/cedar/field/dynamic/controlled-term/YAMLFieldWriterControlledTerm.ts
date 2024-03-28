import { JsonNode, JsonNodeClass } from '../../../types/basic-types/JsonNode';
import { ControlledTermField } from './ControlledTermField';
import { JSONWriterBehavior } from '../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../io/writer/CedarWriters';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YAMLTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YAMLTemplateFieldWriterInternal';
import { YamlKeys } from '../../../constants/YamlKeys';
import { XsdDatatype } from '../../../constants/XsdDatatype';

export class YAMLFieldWriterControlledTerm extends YAMLTemplateFieldWriterInternal {
  constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override expandUINodeForYAML(uiNode: JsonNode, field: ControlledTermField, childInfo: ChildDeploymentInfo): void {
    super.expandUINodeForYAML(uiNode, field, childInfo);
    uiNode[YamlKeys.datatype] = XsdDatatype.ANY_URI;
    if (field.valueRecommendationEnabled) {
      uiNode[YamlKeys.valueRecommendationEnabled] = field.valueRecommendationEnabled;
    }
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: ControlledTermField, childInfo: ChildDeploymentInfo): void {
    super.expandValueConstraintsNodeForYAML(vcNode, field, childInfo);
    if (field.valueConstraints.defaultValue != null) {
      vcNode[YamlKeys.defaultValue] = this.atomicWriter.write(field.valueConstraints.defaultValue.termUri);
      vcNode[YamlKeys.defaultLabel] = field.valueConstraints.defaultValue.rdfsLabel;
    }

    const valuesList: Array<JsonNode> = JsonNodeClass.getEmptyList();
    field.valueConstraints.ontologies.forEach((ontology) => {
      valuesList.push(this.writers.getYAMLWriterForValueConstraint(ontology).getAsJsonNode(ontology));
    });
    field.valueConstraints.classes.forEach((clazz) => {
      valuesList.push(this.writers.getYAMLWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    field.valueConstraints.branches.forEach((clazz) => {
      valuesList.push(this.writers.getYAMLWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    field.valueConstraints.valueSets.forEach((clazz) => {
      valuesList.push(this.writers.getYAMLWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    if (valuesList.length > 0) {
      vcNode[YamlKeys.values] = valuesList;
    }

    const actionsList: Array<JsonNode> = JsonNodeClass.getEmptyList();
    field.valueConstraints.actions.forEach((clazz) => {
      actionsList.push(this.writers.getYAMLWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    if (actionsList.length > 0) {
      vcNode[YamlKeys.actions] = actionsList;
    }
  }
}
