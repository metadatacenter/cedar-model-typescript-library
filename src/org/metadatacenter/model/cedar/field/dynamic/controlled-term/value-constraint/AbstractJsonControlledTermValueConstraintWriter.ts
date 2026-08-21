import { JsonNode } from '../../../../types/basic-types/JsonNode';
import { ControlledTermAbstractValueConstraint } from './ControlledTermAbstractValueConstraint';
import { JsonValueConstraintsWriter } from '../../../JsonValueConstraintsWriter';
import { CedarModel } from '../../../../constants/CedarModel';

export abstract class AbstractJsonControlledTermValueConstraintWriter extends JsonValueConstraintsWriter {
  abstract getAsJsonNode(ontology: ControlledTermAbstractValueConstraint): JsonNode;

  /**
   * The source-explicit keys, written after the ones every constraint has always carried and in the
   * order the Java library writes them. A constraint naming none of them renders exactly as before.
   */
  protected writeSourceAndVersion(entry: JsonNode, constraint: ControlledTermAbstractValueConstraint): void {
    if (constraint.iri !== null && !constraint.iri.isEmpty()) {
      entry[CedarModel.ValueConstraints.iri] = this.atomicWriter.write(constraint.iri);
    }
    if (constraint.sourceSystem !== null) {
      entry[CedarModel.ValueConstraints.sourceSystem] = constraint.sourceSystem;
    }
    const version = constraint.version;
    if (version !== null) {
      const rendering = JsonNode.getEmpty();
      rendering[CedarModel.ValueConstraints.versionId] = version.id;
      if (version.effectiveDate !== null) {
        rendering[CedarModel.ValueConstraints.versionEffectiveDate] = version.effectiveDate;
      }
      if (version.declaredVersion !== null) {
        rendering[CedarModel.ValueConstraints.versionDeclaredVersion] = version.declaredVersion;
      }
      entry[CedarModel.ValueConstraints.version] = rendering;
    }
  }
}
