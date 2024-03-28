import { JsonNode, JsonNodeClass } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { ControlledTermOntology } from './ControlledTermOntology';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../../../io/writer/CedarWriters';
import { AbstractYAMLControlledTermValueConstraintWriter } from '../AbstractYAMLControlledTermValueConstraintWriter';
import { YamlKeys } from '../../../../../constants/YamlKeys';

export class YAMLValueConstraintsOntologyWriter extends AbstractYAMLControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(ontology: ControlledTermOntology): JsonNode {
    const ret = JsonNodeClass.getEmpty();
    // TODO: extract constant
    ret[YamlKeys.valueType] = 'ontology';
    ret[CedarModel.ValueConstraints.acronym] = ontology.acronym;
    ret[CedarModel.ValueConstraints.name] = ontology.name;
    ret[CedarModel.ValueConstraints.uri] = this.atomicWriter.write(ontology.uri);
    ret[CedarModel.ValueConstraints.numTerms] = ontology.numTerms;
    return ret;
  }
}
