import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { ControlledTermField } from './ControlledTermField';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { ControlledTermDefaultValue } from './value-constraint/ControlledTermDefaultValue';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { BioportalTermType } from '../../../types/bioportal-types/BioportalTermType';
import { YamlTemplateFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YamlTemplateFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';
import { YamlValues } from '../../../constants/YamlValues';
import { ControlledTermOntologyBuilder } from './value-constraint/ontology/ControlledTermOntologyBuilder';
import { ControlledTermClassBuilder } from './value-constraint/class/ControlledTermClassBuilder';
import { ControlledTermBranchBuilder } from './value-constraint/branch/ControlledTermBranchBuilder';
import { ControlledTermValueSetBuilder } from './value-constraint/value-set/ControlledTermValueSetBuilder';
import { ControlledTermActionBuilder } from './value-constraint/action/ControlledTermActionBuilder';
import { ControlledTermAction } from './value-constraint/action/ControlledTermAction';
import { ControlledTermFieldImpl } from './ControlledTermFieldImpl';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';
import { Iri } from '../../../types/wrapped-types/Iri';
import { ControlledTermVersion } from './value-constraint/ControlledTermVersion';
import { JavaStrings } from '../../../util/JavaStrings';

/** The kinds a `values:` entry can state, spelled as the writer spells them. */
const VALUE_CONSTRAINT_TYPES: readonly string[] = [
  YamlValues.Controlled.ontology,
  YamlValues.Controlled.class,
  YamlValues.Controlled.branch,
  YamlValues.Controlled.valueSet,
];

const isMapping = (value: unknown): value is JsonNode => value !== null && typeof value === 'object' && !Array.isArray(value);

export class YamlFieldReaderControlledTerm extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    path: JsonPath,
  ): ControlledTermField {
    const field = ControlledTermFieldImpl.buildEmpty();

    const values: JsonNode[] = ReaderUtil.getNodeList(fieldSourceObject, YamlKeys.values);
    values.forEach((valueNode, index) => {
      YamlFieldReaderControlledTerm.assertValueConstraintType(valueNode, path.add(YamlKeys.values, index, YamlKeys.type));
      const type = ReaderUtil.getString(valueNode, YamlKeys.type);
      if (type === YamlValues.Controlled.ontology) {
        const ontologyBuilder = new ControlledTermOntologyBuilder()
          .withAcronym(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.sourceAcronym))
          .withName(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.sourceName))
          .withUri(this.ontologyUri(valueNode))
          .withNumTerms(ReaderUtil.getNumberOrNull(valueNode, YamlKeys.Controlled.termCount));
        this.readSourceAndVersion(valueNode, ontologyBuilder);
        field.valueConstraints.ontologies.push(ontologyBuilder.build());
      } else if (type === YamlValues.Controlled.class) {
        const prefLabel = ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.termLabel);
        // A display label of the template's own where the author set one, the ontology's preferred
        // label otherwise.
        const displayLabel = ReaderUtil.getString(valueNode, YamlKeys.Controlled.termDisplayLabel);
        const classBuilder = new ControlledTermClassBuilder()
          .withUri(ReaderUtil.getIdentifierURI(valueNode, YamlKeys.Controlled.termIri))
          .withSource(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.sourceAcronym))
          .withLabel(displayLabel ?? prefLabel)
          .withPrefLabel(prefLabel)
          .withType(BioportalTermType.forYamlValue(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.termType)));
        this.readSourceAndVersion(valueNode, classBuilder);
        field.valueConstraints.classes.push(classBuilder.build());
      } else if (type === YamlValues.Controlled.branch) {
        const branchBuilder = new ControlledTermBranchBuilder()
          .withUri(ReaderUtil.getIdentifierURI(valueNode, YamlKeys.Controlled.termBaseIri))
          .withSource(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.sourceName))
          .withName(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.termBaseLabel))
          .withAcronym(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.sourceAcronym))
          .withMaxDepth(ReaderUtil.getNumberOrZero(valueNode, YamlKeys.Controlled.termMaxDepth));
        this.readSourceAndVersion(valueNode, branchBuilder);
        field.valueConstraints.branches.push(branchBuilder.build());
      } else if (type === YamlValues.Controlled.valueSet) {
        const valueSetBuilder = new ControlledTermValueSetBuilder()
          .withUri(ReaderUtil.getIdentifierURI(valueNode, YamlKeys.Controlled.termBaseIri))
          // Absent means the count is unknown, as it does for an ontology; zero would claim the set
          // is empty, which is a different thing and one the schema takes literally.
          .withNumTerms(ReaderUtil.getNumberOrNull(valueNode, YamlKeys.Controlled.termCount))
          .withVsCollection(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.sourceAcronym))
          .withName(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.termBaseLabel));
        this.readSourceAndVersion(valueNode, valueSetBuilder);
        field.valueConstraints.valueSets.push(valueSetBuilder.build());
      }
    });

    const defaultNode: JsonNode | null = ReaderUtil.getNodeOrNull(fieldSourceObject, YamlKeys.default);
    if (defaultNode !== null) {
      const uri = ReaderUtil.getIdentifierURI(defaultNode, YamlKeys.value);
      const label = ReaderUtil.getStringOrEmpty(defaultNode, YamlKeys.label);
      field.valueConstraints.defaultValue = new ControlledTermDefaultValue(uri, label);
    }

    const actions: JsonNode[] = ReaderUtil.getNodeList(fieldSourceObject, YamlKeys.actions);
    actions.forEach((actionNode) => {
      const actionBuilder = new ControlledTermActionBuilder()
        .withAction(ControlledTermAction.forAction(Object.hasOwn(actionNode, YamlKeys.action) ? actionNode[YamlKeys.action] : undefined))
        .withSource(ReaderUtil.getStringOrEmpty(actionNode, YamlKeys.Controlled.sourceAcronym))
        .withType(BioportalTermType.forYamlValue(ReaderUtil.getStringOrEmpty(actionNode, YamlKeys.type)))
        .withTermUri(ReaderUtil.getIdentifierURI(actionNode, YamlKeys.Controlled.termIri))
        .withTo(ReaderUtil.getNumber(actionNode, YamlKeys.Controlled.to))
        .withSourceUri(ReaderUtil.getURI(actionNode, YamlKeys.Controlled.sourceIri));
      field.valueConstraints.actions.push(actionBuilder.build());
    });
    return field;
  }

  /**
   * Refuse a `values:` entry whose `type` is not one of the four kinds as the writer spells them, as
   * Java refuses it. Each kind is read from the entries of its own type, so an entry of any other type
   * was passed over and its constraint lost. A literal entry states no type, and is passed over still.
   */
  private static assertValueConstraintType(valueNode: unknown, path: JsonPath): void {
    if (!isMapping(valueNode) || !Object.hasOwn(valueNode, YamlKeys.type)) {
      return;
    }
    const type: unknown = valueNode[YamlKeys.type];
    if (typeof type !== 'string' || !VALUE_CONSTRAINT_TYPES.includes(type)) {
      const shown = typeof type === 'string' ? type : JSON.stringify(type);
      throw new Error(
        `Invalid value constraint type "${shown}" at ${path.toPointer()}. A value constraint type is one of ontology, class, branch or valueSet.`,
      );
    }
  }

  /** Match Java: derive the service address from the acronym, including for legacy YAML. */
  private ontologyUri(node: JsonNode): Iri {
    return new Iri(`https://data.bioontology.org/ontologies/${ReaderUtil.getStringOrEmpty(node, YamlKeys.Controlled.sourceAcronym)}`);
  }

  /** The keys every constraint kind shares: which vocabulary, on which system, at which snapshot. */
  private readSourceAndVersion(valueNode: JsonNode, builder: SourceExplicitBuilder): void {
    const sourceIri = ReaderUtil.getURI(valueNode, YamlKeys.Controlled.sourceIri);
    if (!sourceIri.isEmpty()) {
      builder.withIri(sourceIri);
    }
    builder.withSourceSystem(ReaderUtil.getString(valueNode, YamlKeys.Controlled.sourceSystem));

    builder.withVersion(this.readVersion(ReaderUtil.getNodeOrNull(valueNode, YamlKeys.version)));
  }

  /**
   * The snapshot a constraint is pinned to, or null for the newest one. A version that is not a
   * mapping means the newest, as an absent one does, and the Java library reads it the same way. The
   * meta-schema admits it as a string, and the documented one is "latest". A mapping pins a
   * snapshot, so it must name one, and a missing, empty or blank `id` is refused, as Java and the
   * meta-schema refuse it. Blank is Java's `String.isBlank`.
   */
  private readVersion(versionNode: JsonNode | null): ControlledTermVersion | null {
    if (versionNode === null || typeof versionNode !== 'object' || Array.isArray(versionNode)) {
      return null;
    }
    const id: unknown = ReaderUtil.getNodeOrNull(versionNode, YamlKeys.Controlled.versionId);
    if (typeof id !== 'string' || id === '') {
      throw new Error(`A pinned version needs a non-empty string at "${YamlKeys.version}.${YamlKeys.Controlled.versionId}".`);
    }
    if (JavaStrings.isBlank(id)) {
      throw new Error(`A pinned version's id at "${YamlKeys.version}.${YamlKeys.Controlled.versionId}" must not be blank.`);
    }
    return new ControlledTermVersion(
      id,
      ReaderUtil.getString(versionNode, YamlKeys.Controlled.versionEffectiveDate),
      ReaderUtil.getString(versionNode, YamlKeys.Controlled.versionDeclaredVersion),
    );
  }
}

/** What the four constraint builders have in common, which is what the shared keys are read into. */
interface SourceExplicitBuilder {
  withIri(iri: Iri | null): unknown;
  withSourceSystem(sourceSystem: string | null): unknown;
  withVersion(version: ControlledTermVersion | null): unknown;
}
