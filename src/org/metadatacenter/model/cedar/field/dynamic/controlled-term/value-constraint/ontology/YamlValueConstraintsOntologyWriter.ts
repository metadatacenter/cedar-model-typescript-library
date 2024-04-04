import { JsonNode } from '../../../../../types/basic-types/JsonNode';
import { ControlledTermOntology } from './ControlledTermOntology';
import { AbstractYamlControlledTermValueConstraintWriter } from '../AbstractYamlControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';
import { YamlValues } from '../../../../../constants/YamlValues';
import { YamlWriterBehavior } from '../../../../../../../behavior/YamlWriterBehavior';
import { CedarYamlWriters } from '../../../../../../../io/writer/yaml/CedarYamlWriters';

export class YamlValueConstraintsOntologyWriter extends AbstractYamlControlledTermValueConstraintWriter {
  public constructor(behavior: YamlWriterBehavior, writers: CedarYamlWriters) {
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
