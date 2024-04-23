import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ControlledTermField } from './ControlledTermField';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { YamlTemplateFieldWriterInternal } from '../../../../../io/writer/yaml/YamlTemplateFieldWriterInternal';
import { YamlKeys } from '../../../constants/YamlKeys';
import { XsdDatatype } from '../../../constants/XsdDatatype';
import { CedarYamlWriters } from '../../../../../io/writer/yaml/CedarYamlWriters';
import { YamlWriterBehavior } from '../../../../../behavior/YamlWriterBehavior';

export class YamlFieldWriterControlledTerm extends YamlTemplateFieldWriterInternal {
  constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
    super(behavior, writers);
  }

  override expandUINodeForYAML(_field: ControlledTermField): JsonNode {
    const ret: JsonNode = {
      [YamlKeys.datatype]: XsdDatatype.ANY_URI,
    };
    return ret;
  }

  override expandValueConstraintsNodeForYAML(vcNode: JsonNode, field: ControlledTermField, childInfo: ChildDeploymentInfo): void {
    if (field.valueConstraints.defaultValue != null) {
      const defaultNode = {
        [YamlKeys.value]: this.atomicWriter.write(field.valueConstraints.defaultValue.termUri),
        [YamlKeys.label]: field.valueConstraints.defaultValue.rdfsLabel,
      };
      vcNode[YamlKeys.default] = defaultNode;
    }

    const valuesList: Array<JsonNode> = JsonNode.getEmptyList();
    field.valueConstraints.ontologies.forEach((ontology) => {
      valuesList.push(this.writers.getWriterForValueConstraint(ontology).getAsJsonNode(ontology));
    });
    field.valueConstraints.classes.forEach((clazz) => {
      valuesList.push(this.writers.getWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    field.valueConstraints.branches.forEach((clazz) => {
      valuesList.push(this.writers.getWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    field.valueConstraints.valueSets.forEach((clazz) => {
      valuesList.push(this.writers.getWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    if (valuesList.length > 0) {
      vcNode[YamlKeys.values] = valuesList;
    }

    const actionsList: Array<JsonNode> = JsonNode.getEmptyList();
    field.valueConstraints.actions.forEach((clazz) => {
      actionsList.push(this.writers.getWriterForValueConstraint(clazz).getAsJsonNode(clazz));
    });
    if (actionsList.length > 0) {
      vcNode[YamlKeys.actions] = actionsList;
    }
  }
}
