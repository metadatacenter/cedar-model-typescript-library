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
    // The reader derives a BioPortal address from the acronym, so the service address is written only
    // when it is not a BioPortal address for this acronym.
    const bioPortalAcronym = YamlValues.Controlled.bioPortalOntologyAddress.exec(ontology.uri.getValue())?.[1];
    if (!ontology.uri.isEmpty() && bioPortalAcronym !== ontology.acronym) {
      ret[YamlKeys.Controlled.sourceUri] = this.atomicWriter.write(ontology.uri);
    }
    if (ontology.numTerms !== null) {
      ret[YamlKeys.Controlled.termCount] = ontology.numTerms;
    }
    this.writeVersion(ret, ontology);
    return ret;
  }
}
