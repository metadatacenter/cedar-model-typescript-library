import { JsonNode } from '../../../../types/basic-types/JsonNode';
import { ControlledTermAbstractValueConstraint } from './ControlledTermAbstractValueConstraint';
import { YamlValueConstraintsWriter } from '../../../YamlValueConstraintsWriter';
import { YamlKeys } from '../../../../constants/YamlKeys';

export abstract class AbstractYamlControlledTermValueConstraintWriter extends YamlValueConstraintsWriter {
  abstract getAsJsonNode(ontology: ControlledTermAbstractValueConstraint): JsonNode;

  /**
   * The system serving the vocabulary, written directly after the entry's type. Omitted when the
   * constraint names none, which means BioPortal.
   */
  protected writeSourceSystem(entry: JsonNode, constraint: ControlledTermAbstractValueConstraint): void {
    if (constraint.sourceSystem !== null) {
      entry[YamlKeys.Controlled.sourceSystem] = constraint.sourceSystem;
    }
  }

  /** The source ontology's canonical identity, written after the keys naming the source. */
  protected writeSourceIri(entry: JsonNode, constraint: ControlledTermAbstractValueConstraint): void {
    if (constraint.iri !== null && !constraint.iri.isEmpty()) {
      entry[YamlKeys.Controlled.sourceIri] = this.atomicWriter.write(constraint.iri);
    }
  }

  /** The pinned snapshot, written last. Omitted when the entry resolves against the latest. */
  protected writeVersion(entry: JsonNode, constraint: ControlledTermAbstractValueConstraint): void {
    const version = constraint.version;
    if (version === null) {
      return;
    }
    const rendering = JsonNode.getEmpty();
    rendering[YamlKeys.Controlled.versionId] = version.id;
    if (version.effectiveDate !== null) {
      rendering[YamlKeys.Controlled.versionEffectiveDate] = version.effectiveDate;
    }
    if (version.declaredVersion !== null) {
      rendering[YamlKeys.Controlled.versionDeclaredVersion] = version.declaredVersion;
    }
    entry[YamlKeys.version] = rendering;
  }
}
