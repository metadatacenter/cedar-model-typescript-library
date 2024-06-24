import { JsonNode } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { ControlledTermOntology } from './ControlledTermOntology';
import { JsonWriterBehavior } from '../../../../../../../behavior/JsonWriterBehavior';
import { AbstractJsonControlledTermValueConstraintWriter } from '../AbstractJsonControlledTermValueConstraintWriter';
import { CedarJsonWriters } from '../../../../../../../io/writer/json/CedarJsonWriters';

export class JsonValueConstraintsOntologyWriter extends AbstractJsonControlledTermValueConstraintWriter {
  public constructor(behavior: JsonWriterBehavior, writers: CedarJsonWriters) {
    super(behavior, writers);
  }

  public getAsJsonString(ontology: ControlledTermOntology, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(ontology), null, indent);
  }

  override getAsJsonNode(ontology: ControlledTermOntology): JsonNode {
    const ret = JsonNode.getEmpty();
    ret[CedarModel.ValueConstraints.uri] = this.atomicWriter.write(ontology.uri);
    ret[CedarModel.ValueConstraints.acronym] = ontology.acronym;
    ret[CedarModel.ValueConstraints.name] = ontology.name;
    if (ontology.numTerms !== null) {
      ret[CedarModel.ValueConstraints.numTerms] = ontology.numTerms;
    }
    return ret;
  }
}
