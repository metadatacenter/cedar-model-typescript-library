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
import { ControlledTermFieldImpl } from './ControlledTermFieldImpl';
import { YamlArtifactParsingResult } from '../../../util/compare/YamlArtifactParsingResult';
import { Iri } from '../../../types/wrapped-types/Iri';
import { ControlledTermVersion } from './value-constraint/ControlledTermVersion';

export class YamlFieldReaderControlledTerm extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): ControlledTermField {
    const field = ControlledTermFieldImpl.buildEmpty();

    const values: JsonNode[] = ReaderUtil.getNodeList(fieldSourceObject, YamlKeys.values);
    values.forEach((valueNode) => {
      const type = ReaderUtil.getString(valueNode, YamlKeys.type);
      if (type === YamlValues.Controlled.ontology) {
        const ontologyBuilder = new ControlledTermOntologyBuilder()
          .withAcronym(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.sourceAcronym))
          .withName(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.sourceName))
          .withUri(this.deriveOntologyUri(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.sourceAcronym)))
          .withNumTerms(ReaderUtil.getNumberOrNull(valueNode, YamlKeys.Controlled.termCount));
        this.readSourceAndVersion(valueNode, ontologyBuilder);
        field.valueConstraints.ontologies.push(ontologyBuilder.build());
      } else if (type === YamlValues.Controlled.class) {
        const prefLabel = ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.termLabel);
        const classBuilder = new ControlledTermClassBuilder()
          .withUri(ReaderUtil.getURI(valueNode, YamlKeys.Controlled.termIri))
          .withSource(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.sourceAcronym))
          // One label per class in this dialect: the display label is the preferred label.
          .withLabel(prefLabel)
          .withPrefLabel(prefLabel)
          .withType(BioportalTermType.forYamlValue(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.termType)));
        this.readSourceAndVersion(valueNode, classBuilder);
        field.valueConstraints.classes.push(classBuilder.build());
      } else if (type === YamlValues.Controlled.branch) {
        const branchBuilder = new ControlledTermBranchBuilder()
          .withUri(ReaderUtil.getURI(valueNode, YamlKeys.Controlled.termBaseIri))
          .withSource(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.sourceName))
          .withName(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.termBaseLabel))
          .withAcronym(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.sourceAcronym))
          .withMaxDepth(ReaderUtil.getNumberOrZero(valueNode, YamlKeys.Controlled.termMaxDepth));
        this.readSourceAndVersion(valueNode, branchBuilder);
        field.valueConstraints.branches.push(branchBuilder.build());
      } else if (type === YamlValues.Controlled.valueSet) {
        const valueSetBuilder = new ControlledTermValueSetBuilder()
          .withUri(ReaderUtil.getURI(valueNode, YamlKeys.Controlled.termBaseIri))
          .withNumTerms(ReaderUtil.getNumberOrZero(valueNode, YamlKeys.Controlled.termCount))
          .withVsCollection(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.sourceAcronym))
          .withName(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.termBaseLabel));
        this.readSourceAndVersion(valueNode, valueSetBuilder);
        field.valueConstraints.valueSets.push(valueSetBuilder.build());
      }
    });

    const defaultNode: JsonNode | null = ReaderUtil.getNodeOrNull(fieldSourceObject, YamlKeys.default);
    if (defaultNode !== null) {
      const uri = ReaderUtil.getURI(defaultNode, YamlKeys.value);
      const label = ReaderUtil.getStringOrEmpty(defaultNode, YamlKeys.label);
      field.valueConstraints.defaultValue = new ControlledTermDefaultValue(uri, label);
    }

    const actions: JsonNode[] = ReaderUtil.getNodeList(fieldSourceObject, YamlKeys.actions);
    actions.forEach((actionNode) => {
      const actionBuilder = new ControlledTermActionBuilder()
        .withAction(ReaderUtil.getStringOrEmpty(actionNode, YamlKeys.action))
        .withSource(ReaderUtil.getStringOrEmpty(actionNode, YamlKeys.Controlled.sourceAcronym))
        .withType(BioportalTermType.forYamlValue(ReaderUtil.getStringOrEmpty(actionNode, YamlKeys.type)))
        .withTermUri(ReaderUtil.getURI(actionNode, YamlKeys.Controlled.termIri))
        .withTo(ReaderUtil.getNumber(actionNode, YamlKeys.Controlled.to))
        .withSourceUri(ReaderUtil.getURI(actionNode, YamlKeys.Controlled.sourceIri));
      field.valueConstraints.actions.push(actionBuilder.build());
    });
    return field;
  }

  /**
   * Reconstruct an ontology's BioPortal address from its acronym.
   *
   * The entry carries no such key: the address is derivable, and what identifies the ontology across
   * systems is its `sourceIri`. The model and the JSON Schema it renders to still require the address,
   * and BioPortal — the only system served today, and what an absent `sourceSystem` means — addresses
   * every ontology the same way. Another system would need its own rule.
   */
  private deriveOntologyUri(acronym: string): Iri {
    return new Iri(`https://data.bioontology.org/ontologies/${acronym}`);
  }

  /** The keys every constraint kind shares: which vocabulary, on which system, at which snapshot. */
  private readSourceAndVersion(valueNode: JsonNode, builder: SourceExplicitBuilder): void {
    const sourceIri = ReaderUtil.getURI(valueNode, YamlKeys.Controlled.sourceIri);
    if (!sourceIri.isEmpty()) {
      builder.withIri(sourceIri);
    }
    builder.withSourceSystem(ReaderUtil.getString(valueNode, YamlKeys.Controlled.sourceSystem));

    const versionNode: JsonNode | null = ReaderUtil.getNodeOrNull(valueNode, YamlKeys.version);
    if (versionNode !== null) {
      builder.withVersion(
        new ControlledTermVersion(
          ReaderUtil.getStringOrEmpty(versionNode, YamlKeys.Controlled.versionId),
          ReaderUtil.getString(versionNode, YamlKeys.Controlled.versionEffectiveDate),
          ReaderUtil.getString(versionNode, YamlKeys.Controlled.versionDeclaredVersion),
        ),
      );
    }
  }
}

/** What the four constraint builders have in common, which is what the shared keys are read into. */
interface SourceExplicitBuilder {
  withIri(iri: Iri | null): unknown;
  withSourceSystem(sourceSystem: string | null): unknown;
  withVersion(version: ControlledTermVersion | null): unknown;
}
