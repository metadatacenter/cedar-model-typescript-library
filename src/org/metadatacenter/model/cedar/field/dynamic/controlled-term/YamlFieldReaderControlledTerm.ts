import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonPath } from '../../../util/path/JsonPath';
import { ControlledTermField } from './ControlledTermField';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { ControlledTermOntology } from './value-constraint/ontology/ControlledTermOntology';
import { ControlledTermClass } from './value-constraint/class/ControlledTermClass';
import { ControlledTermBranch } from './value-constraint/branch/ControlledTermBranch';
import { ControlledTermValueSet } from './value-constraint/value-set/ControlledTermValueSet';
import { ControlledTermDefaultValue } from './value-constraint/ControlledTermDefaultValue';
import { JsonSchema } from '../../../constants/JsonSchema';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { ControlledTermAction } from './value-constraint/action/ControlledTermAction';
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

export class YamlFieldReaderControlledTerm extends YamlTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    _childInfo: ChildDeploymentInfo,
    _parsingResult: YamlArtifactParsingResult,
    _path: JsonPath,
  ): ControlledTermField {
    const field = ControlledTermFieldImpl.buildEmpty();

    field.valueRecommendationEnabled = ReaderUtil.getBoolean(fieldSourceObject, YamlKeys.valueRecommendation);

    const values: JsonNode[] = ReaderUtil.getNodeList(fieldSourceObject, YamlKeys.values);
    values.forEach((valueNode) => {
      const type = ReaderUtil.getString(valueNode, YamlKeys.type);
      if (type === YamlValues.Controlled.ontology) {
        const ontologyBuilder = new ControlledTermOntologyBuilder()
          .withAcronym(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.acronym))
          .withName(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.ontologyName))
          .withUri(ReaderUtil.getURI(valueNode, YamlKeys.Controlled.iri))
          .withNumTerms(ReaderUtil.getNumberOrNull(valueNode, YamlKeys.Controlled.numTerms));
        field.valueConstraints.ontologies.push(ontologyBuilder.build());
      } else if (type === YamlValues.Controlled.class) {
        const classBuilder = new ControlledTermClassBuilder()
          .withUri(ReaderUtil.getURI(valueNode, YamlKeys.Controlled.iri))
          .withSource(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.acronym))
          .withLabel(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.label))
          .withPrefLabel(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.termLabel))
          .withType(BioportalTermType.forYamlValue(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.type)));
        field.valueConstraints.classes.push(classBuilder.build());
      } else if (type === YamlValues.Controlled.branch) {
        const branchBuilder = new ControlledTermBranchBuilder()
          .withUri(ReaderUtil.getURI(valueNode, YamlKeys.Controlled.iri))
          .withSource(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.ontologyName))
          .withName(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.termLabel))
          .withAcronym(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.acronym))
          .withMaxDepth(ReaderUtil.getNumberOrZero(valueNode, YamlKeys.Controlled.maxDepth));
        field.valueConstraints.branches.push(branchBuilder.build());
      } else if (type === YamlValues.Controlled.valueSet) {
        const valueSetBuilder = new ControlledTermValueSetBuilder()
          .withUri(ReaderUtil.getURI(valueNode, YamlKeys.Controlled.iri))
          .withNumTerms(ReaderUtil.getNumberOrZero(valueNode, YamlKeys.Controlled.numTerms))
          .withVsCollection(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.acronym))
          .withName(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.valueSetName));
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
}
