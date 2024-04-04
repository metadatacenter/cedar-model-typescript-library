import { JsonNode, JsonNodeClass } from '../../../../../types/basic-types/JsonNode';
import { CedarModel } from '../../../../../constants/CedarModel';
import { ControlledTermOntology } from './ControlledTermOntology';
import { JSONWriterBehavior } from '../../../../../../../behavior/JSONWriterBehavior';
import { AbstractJSONControlledTermValueConstraintWriter } from '../AbstractJSONControlledTermValueConstraintWriter';
import { CedarJSONWriters } from '../../../../../../../io/writer/json/CedarJSONWriters';

export class JSONValueConstraintsOntologyWriter extends AbstractJSONControlledTermValueConstraintWriter {
  public constructor(behavior: JSONWriterBehavior, writers: CedarJSONWriters) {
    super(behavior, writers);
  }

  public getAsJsonString(ontology: ControlledTermOntology, indent: number = 2): string {
    return JSON.stringify(this.getAsJsonNode(ontology), null, indent);
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
