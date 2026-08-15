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
    this.writeSourceSystem(ret, ontology);
    ret[YamlKeys.Controlled.sourceAcronym] = ontology.acronym;
    ret[YamlKeys.Controlled.sourceName] = ontology.name;
    this.writeSourceIri(ret, ontology);
    // The ontology's BioPortal address is not written: it is derivable from the acronym, and the
    // reader reconstructs it.
    if (ontology.numTerms !== null) {
      ret[YamlKeys.Controlled.termCount] = ontology.numTerms;
    }
    this.writeVersion(ret, ontology);
    return ret;
  }
}
