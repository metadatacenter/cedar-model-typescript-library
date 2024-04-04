import { JsonNode } from '../../../../../types/basic-types/JsonNode';
import { ControlledTermOntology } from './ControlledTermOntology';
import { AbstractYAMLControlledTermValueConstraintWriter } from '../AbstractYAMLControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';
import { YamlValues } from '../../../../../constants/YamlValues';
import { YAMLWriterBehavior } from '../../../../../../../behavior/YAMLWriterBehavior';
import { CedarYAMLWriters } from '../../../../../../../io/writer/yaml/CedarYAMLWriters';

export class YAMLValueConstraintsOntologyWriter extends AbstractYAMLControlledTermValueConstraintWriter {
  public constructor(behavior: YAMLWriterBehavior, writers: CedarYAMLWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(ontology: ControlledTermOntology): JsonNode {
    const ret = JsonNode.getEmpty();
    ret[YamlKeys.type] = YamlValues.Controlled.ontology;
    ret[YamlKeys.Controlled.acronym] = ontology.acronym;
    ret[YamlKeys.Controlled.ontologyName] = ontology.name;
    ret[YamlKeys.Controlled.iri] = this.atomicWriter.write(ontology.uri);
    ret[YamlKeys.Controlled.numTerms] = ontology.numTerms;
    return ret;
  }
}
