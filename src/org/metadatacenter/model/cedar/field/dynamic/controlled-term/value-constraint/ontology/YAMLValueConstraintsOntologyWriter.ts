import { JsonNode, JsonNodeClass } from '../../../../../types/basic-types/JsonNode';
import { ControlledTermOntology } from './ControlledTermOntology';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../../../io/writer/CedarWriters';
import { AbstractYAMLControlledTermValueConstraintWriter } from '../AbstractYAMLControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';
import { YamlValues } from '../../../../../constants/YamlValues';

export class YAMLValueConstraintsOntologyWriter extends AbstractYAMLControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(ontology: ControlledTermOntology): JsonNode {
    const ret = JsonNodeClass.getEmpty();
    ret[YamlKeys.type] = YamlValues.Controlled.ontology;
    ret[YamlKeys.Controlled.acronym] = ontology.acronym;
    ret[YamlKeys.Controlled.ontologyName] = ontology.name;
    ret[YamlKeys.Controlled.iri] = this.atomicWriter.write(ontology.uri);
    ret[YamlKeys.Controlled.numTerms] = ontology.numTerms;
    return ret;
  }
}
