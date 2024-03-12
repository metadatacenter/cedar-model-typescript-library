import { JsonNode, JsonNodeClass } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { ControlledTermOntology } from './ControlledTermOntology';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { CedarWriters } from '../../../../../../../io/writer/CedarWriters';
import { AbstractJSONControlledTermValueConstraintWriter } from '../AbstractJSONControlledTermValueConstraintWriter';

export class JSONValueConstraintsOntologyWriter extends AbstractJSONControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarWriters) {
    super(behavior, writers);
  }

  override getAsJsonNode(ontology: ControlledTermOntology): JsonNode {
    const ret = JsonNodeClass.getEmpty();
    ret[CedarModel.ValueConstraints.acronym] = ontology.acronym;
    ret[CedarModel.ValueConstraints.name] = ontology.name;
    ret[CedarModel.ValueConstraints.uri] = this.atomicWriter.write(ontology.uri);
    ret[CedarModel.ValueConstraints.numTerms] = ontology.numTerms;
    return ret;
  }
}
