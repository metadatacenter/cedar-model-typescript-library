import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ControlledTermField } from './ControlledTermField';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { JsonTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JsonTemplateFieldTypeSpecificReader';
import { ControlledTermOntology } from './value-constraint/ontology/ControlledTermOntology';
import { ControlledTermClass } from './value-constraint/class/ControlledTermClass';
import { ControlledTermBranch } from './value-constraint/branch/ControlledTermBranch';
import { ControlledTermValueSet } from './value-constraint/value-set/ControlledTermValueSet';
import { ControlledTermDefaultValue } from './value-constraint/ControlledTermDefaultValue';
import { JsonSchema } from '../../../constants/JsonSchema';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { ControlledTermAction } from './value-constraint/action/ControlledTermAction';
import { BioportalTermType } from '../../../types/bioportal-types/BioportalTermType';
import { ControlledTermFieldImpl } from './ControlledTermFieldImpl';
import { ControlledTermVersion } from './value-constraint/ControlledTermVersion';
import { Iri } from '../../../types/wrapped-types/Iri';
import { JavaStrings } from '../../../util/JavaStrings';
import { JsonTermConstraintChecks } from '../../../../../io/reader/json/JsonTermConstraintChecks';

export class JsonFieldReaderControlledTerm extends JsonTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    _parsingResult: JsonArtifactParsingResult,
    path: JsonPath,
  ): ControlledTermField {
    const field = ControlledTermFieldImpl.buildEmpty();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);

    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      const at = path.add(CedarModel.valueConstraints);
      // The reads below take each constraint to be an object, so one that is not is refused first.
      JsonTermConstraintChecks.assertEntriesAreObjects(fieldSourceObject, path);
      field.valueConstraints.ontologies = this.getOntologies(
        ReaderUtil.getNodeList(valueConstraints, CedarModel.ontologies),
        at.add(CedarModel.ontologies),
      );
      field.valueConstraints.classes = this.getClasses(ReaderUtil.getNodeList(valueConstraints, CedarModel.classes));
      field.valueConstraints.branches = this.getBranches(
        ReaderUtil.getNodeList(valueConstraints, CedarModel.branches),
        at.add(CedarModel.branches),
      );
      field.valueConstraints.valueSets = this.getValueSets(
        ReaderUtil.getNodeList(valueConstraints, CedarModel.valueSets),
        at.add(CedarModel.valueSets),
      );
      // The reads above refuse some malformed constraints, each with the message it always gave. Java
      // refuses more, such as an ontology with no acronym, and these checks refuse the rest.
      JsonTermConstraintChecks.assertReadable(fieldSourceObject, path);
      field.valueConstraints.defaultValue = this.getDefaultValue(ReaderUtil.getNodeOrNull(valueConstraints, CedarModel.defaultValue));
      field.valueConstraints.actions = this.getActions(ReaderUtil.getNodeList(valueConstraints, CedarModel.actions));
    }
    return field;
  }

  private getOntologies(nodeList: Array<JsonNode>, path: JsonPath): Array<ControlledTermOntology> {
    const ret: Array<ControlledTermOntology> = [];
    nodeList.forEach((o, index) => {
      const ontology = new ControlledTermOntology(
        ReaderUtil.getStringOrEmpty(o, CedarModel.ValueConstraints.acronym),
        ReaderUtil.getStringOrEmpty(o, CedarModel.ValueConstraints.name),
        ReaderUtil.getJsonJavaIntOrNull(o, CedarModel.ValueConstraints.numTerms, path.add(index)),
        ReaderUtil.getIdentifierURI(o, CedarModel.ValueConstraints.uri),
        ...JsonFieldReaderControlledTerm.readSourceAndVersion(o),
      );
      ret.push(ontology);
    });
    return ret;
  }

  private getClasses(nodeList: Array<JsonNode>): Array<ControlledTermClass> {
    const ret: Array<ControlledTermClass> = [];
    nodeList.forEach((c) => {
      const clazz = new ControlledTermClass(
        ReaderUtil.getStringOrEmpty(c, CedarModel.ValueConstraints.label),
        ReaderUtil.getStringOrEmpty(c, CedarModel.ValueConstraints.source),
        BioportalTermType.forJsonType(JsonFieldReaderControlledTerm.own(c, CedarModel.ValueConstraints.type), 'A class constraint'),
        ReaderUtil.getStringOrEmpty(c, CedarModel.ValueConstraints.prefLabel),
        ReaderUtil.getIdentifierURI(c, CedarModel.ValueConstraints.uri),
        ...JsonFieldReaderControlledTerm.readSourceAndVersion(c),
      );
      ret.push(clazz);
    });
    return ret;
  }

  private getBranches(nodeList: Array<JsonNode>, path: JsonPath): Array<ControlledTermBranch> {
    const ret: Array<ControlledTermBranch> = [];
    nodeList.forEach((b, index) => {
      const branch = new ControlledTermBranch(
        ReaderUtil.getStringOrEmpty(b, CedarModel.ValueConstraints.source),
        ReaderUtil.getStringOrEmpty(b, CedarModel.ValueConstraints.acronym),
        ReaderUtil.getStringOrEmpty(b, CedarModel.ValueConstraints.name),
        // Java requires a branch to state its depth as an integer, so an absent or null one is refused.
        ReaderUtil.getRequiredJsonJavaInt(b, CedarModel.ValueConstraints.maxDepth, path.add(index)),
        ReaderUtil.getIdentifierURI(b, CedarModel.ValueConstraints.uri),
        ...JsonFieldReaderControlledTerm.readSourceAndVersion(b),
      );
      ret.push(branch);
    });
    return ret;
  }

  private getValueSets(nodeList: Array<JsonNode>, path: JsonPath): Array<ControlledTermValueSet> {
    const ret: Array<ControlledTermValueSet> = [];
    nodeList.forEach((vs, index) => {
      const valueSet = new ControlledTermValueSet(
        ReaderUtil.getStringOrEmpty(vs, CedarModel.ValueConstraints.vsCollection),
        ReaderUtil.getStringOrEmpty(vs, CedarModel.ValueConstraints.name),
        ReaderUtil.getJsonJavaIntOrNull(vs, CedarModel.ValueConstraints.numTerms, path.add(index)),
        ReaderUtil.getIdentifierURI(vs, CedarModel.ValueConstraints.uri),
        ...JsonFieldReaderControlledTerm.readSourceAndVersion(vs),
      );
      ret.push(valueSet);
    });
    return ret;
  }

  private getActions(nodeList: Array<JsonNode>): Array<ControlledTermAction> {
    const ret: Array<ControlledTermAction> = [];
    nodeList.forEach((vs) => {
      const action = new ControlledTermAction(
        ReaderUtil.getNumber(vs, CedarModel.ValueConstraints.to),
        ControlledTermAction.forAction(JsonFieldReaderControlledTerm.own(vs, CedarModel.ValueConstraints.action)),
        ReaderUtil.getIdentifierURI(vs, CedarModel.ValueConstraints.termUri),
        // Not an identifier: the legacy editor writes "template" here for one of the template's own classes.
        ReaderUtil.getURI(vs, CedarModel.ValueConstraints.sourceUri),
        ReaderUtil.getStringOrEmpty(vs, CedarModel.ValueConstraints.source),
        BioportalTermType.forJsonType(JsonFieldReaderControlledTerm.own(vs, CedarModel.ValueConstraints.type), 'A controlled-term action'),
      );
      ret.push(action);
    });
    return ret;
  }

  /** The value at `key`, or undefined where the node states none. */
  private static own(node: JsonNode, key: string): unknown {
    return Object.hasOwn(node, key) ? node[key] : undefined;
  }

  /**
   * The three source-explicit keys, in the order every constraint constructor takes them. Optional and
   * usually absent: a constraint written before they existed has none, and reads as it always did.
   */
  private static readSourceAndVersion(node: JsonNode): [Iri | null, string | null, ControlledTermVersion | null] {
    const iri = ReaderUtil.getURI(node, CedarModel.ValueConstraints.iri);
    const version = JsonFieldReaderControlledTerm.readVersion(ReaderUtil.getNodeOrNull(node, CedarModel.ValueConstraints.version));
    return [iri.isEmpty() ? null : iri, ReaderUtil.getString(node, CedarModel.ValueConstraints.sourceSystem), version];
  }

  /**
   * The snapshot a constraint is pinned to, or null for the newest one. A version that is not an
   * object means the newest, as an absent one does, and the Java library reads it the same way. The
   * meta-schema admits it as a string, and the documented one is "latest". An object pins a
   * snapshot, so it must name one, and a missing, empty or blank `id` is refused, as Java and the
   * meta-schema refuse it. Blank is Java's `String.isBlank`.
   */
  private static readVersion(versionNode: JsonNode | null): ControlledTermVersion | null {
    if (versionNode === null || typeof versionNode !== 'object' || Array.isArray(versionNode)) {
      return null;
    }
    const id: unknown = ReaderUtil.getNodeOrNull(versionNode, CedarModel.ValueConstraints.versionId);
    if (typeof id !== 'string' || id === '') {
      throw new Error(
        `A pinned version needs a non-empty string at "${CedarModel.ValueConstraints.version}.${CedarModel.ValueConstraints.versionId}".`,
      );
    }
    if (JavaStrings.isBlank(id)) {
      throw new Error(
        `A pinned version's id at "${CedarModel.ValueConstraints.version}.${CedarModel.ValueConstraints.versionId}" must not be blank.`,
      );
    }
    return new ControlledTermVersion(
      id,
      ReaderUtil.getString(versionNode, CedarModel.ValueConstraints.versionEffectiveDate),
      ReaderUtil.getString(versionNode, CedarModel.ValueConstraints.versionDeclaredVersion),
    );
  }

  private getDefaultValue(node: JsonNode | null): ControlledTermDefaultValue | null {
    if (node == null) {
      return null;
    }
    const rdfsLabel: string | null = ReaderUtil.getString(node, JsonSchema.rdfsLabel);
    if (Object.hasOwn(node, JsonSchema.termUri) || rdfsLabel !== null) {
      // A stated default names a term, so its termUri is an identifier, as Java requires.
      return new ControlledTermDefaultValue(ReaderUtil.getIdentifierURI(node, JsonSchema.termUri), rdfsLabel ?? '');
    } else {
      return null;
    }
  }
}
