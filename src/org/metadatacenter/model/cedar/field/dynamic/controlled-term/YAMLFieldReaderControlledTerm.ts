import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
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
import { YAMLFieldTypeSpecificReader } from '../../../../../io/reader/yaml/YAMLFieldTypeSpecificReader';
import { YamlKeys } from '../../../constants/YamlKeys';
import { YamlValues } from '../../../constants/YamlValues';
import { ControlledTermOntologyBuilder } from './value-constraint/ontology/ControlledTermOntologyBuilder';
import { ControlledTermClassBuilder } from './value-constraint/class/ControlledTermClassBuilder';
import { ControlledTermBranchBuilder } from './value-constraint/branch/ControlledTermBranchBuilder';
import { ControlledTermValueSetBuilder } from './value-constraint/value-set/ControlledTermValueSetBuilder';
import { ControlledTermActionBuilder } from './value-constraint/action/ControlledTermActionBuilder';

export class YAMLFieldReaderControlledTerm extends YAMLFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    _parsingResult: ParsingResult,
    _path: JsonPath,
  ): ControlledTermField {
    const field = ControlledTermField.buildEmptyWithNullValues();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);

    field.valueRecommendationEnabled = ReaderUtil.getBoolean(fieldSourceObject, YamlKeys.valueRecommendationEnabled);

    const values: JsonNode[] = ReaderUtil.getNodeList(fieldSourceObject, YamlKeys.values);
    values.forEach((valueNode) => {
      const type = ReaderUtil.getString(valueNode, YamlKeys.type);
      if (type === YamlValues.Controlled.ontology) {
        const ontologyBuilder = new ControlledTermOntologyBuilder()
          .withAcronym(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.acronym))
          .withName(ReaderUtil.getStringOrEmpty(valueNode, YamlKeys.Controlled.ontologyName))
          .withUri(ReaderUtil.getURI(valueNode, YamlKeys.Controlled.iri))
          .withNumTerms(ReaderUtil.getNumberOrZero(valueNode, YamlKeys.Controlled.numTerms));
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
      const defaultValue = new ControlledTermDefaultValue(uri, label);
      field.valueConstraints.defaultValue = defaultValue;
    }

    const actions: JsonNode[] = ReaderUtil.getNodeList(fieldSourceObject, YamlKeys.actions);
    actions.forEach((actionNode) => {
      const actionBuilder = new ControlledTermActionBuilder()
        .withAction(ReaderUtil.getStringOrEmpty(actionNode, YamlKeys.action))
        .withSource(ReaderUtil.getStringOrEmpty(actionNode, YamlKeys.Controlled.sourceAcronym))
        .withType(ReaderUtil.getStringOrEmpty(actionNode, YamlKeys.type))
        .withTermUri(ReaderUtil.getURI(actionNode, YamlKeys.Controlled.termIri))
        .withTo(ReaderUtil.getNumber(actionNode, YamlKeys.Controlled.to))
        .withSourceUri(ReaderUtil.getURI(actionNode, YamlKeys.Controlled.sourceIri));
      field.valueConstraints.actions.push(actionBuilder.build());
    });
    return field;
  }

  private getOntologies(nodeList: Array<JsonNode>): Array<ControlledTermOntology> {
    const ret: Array<ControlledTermOntology> = [];
    nodeList.forEach((o) => {
      const ontology = new ControlledTermOntology(
        ReaderUtil.getStringOrEmpty(o, CedarModel.ValueConstraints.acronym),
        ReaderUtil.getStringOrEmpty(o, CedarModel.ValueConstraints.name),
        ReaderUtil.getNumberOrZero(o, CedarModel.ValueConstraints.numTerms),
        ReaderUtil.getURI(o, CedarModel.ValueConstraints.uri),
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
        BioportalTermType.forJsonValue(ReaderUtil.getStringOrEmpty(c, CedarModel.ValueConstraints.type)),
        ReaderUtil.getStringOrEmpty(c, CedarModel.ValueConstraints.prefLabel),
        ReaderUtil.getURI(c, CedarModel.ValueConstraints.uri),
      );
      ret.push(clazz);
    });
    return ret;
  }

  private getBranches(nodeList: Array<JsonNode>): Array<ControlledTermBranch> {
    const ret: Array<ControlledTermBranch> = [];
    nodeList.forEach((b) => {
      const branch = new ControlledTermBranch(
        ReaderUtil.getStringOrEmpty(b, CedarModel.ValueConstraints.source),
        ReaderUtil.getStringOrEmpty(b, CedarModel.ValueConstraints.acronym),
        ReaderUtil.getStringOrEmpty(b, CedarModel.ValueConstraints.name),
        ReaderUtil.getNumberOrZero(b, CedarModel.ValueConstraints.maxDepth),
        ReaderUtil.getURI(b, CedarModel.ValueConstraints.uri),
      );
      ret.push(branch);
    });
    return ret;
  }

  private getValueSets(nodeList: Array<JsonNode>): Array<ControlledTermValueSet> {
    const ret: Array<ControlledTermValueSet> = [];
    nodeList.forEach((vs) => {
      const branch = new ControlledTermValueSet(
        ReaderUtil.getStringOrEmpty(vs, CedarModel.ValueConstraints.vsCollection),
        ReaderUtil.getStringOrEmpty(vs, CedarModel.ValueConstraints.name),
        ReaderUtil.getNumberOrZero(vs, CedarModel.ValueConstraints.numTerms),
        ReaderUtil.getURI(vs, CedarModel.ValueConstraints.uri),
      );
      ret.push(branch);
    });
    return ret;
  }

  private getActions(nodeList: Array<JsonNode>): Array<ControlledTermAction> {
    const ret: Array<ControlledTermAction> = [];
    nodeList.forEach((vs) => {
      const action = new ControlledTermAction(
        ReaderUtil.getNumber(vs, CedarModel.ValueConstraints.to),
        ReaderUtil.getStringOrEmpty(vs, CedarModel.ValueConstraints.action),
        ReaderUtil.getURI(vs, CedarModel.ValueConstraints.termUri),
        ReaderUtil.getURI(vs, CedarModel.ValueConstraints.sourceUri),
        ReaderUtil.getStringOrEmpty(vs, CedarModel.ValueConstraints.source),
        ReaderUtil.getStringOrEmpty(vs, CedarModel.ValueConstraints.type),
      );
      ret.push(action);
    });
    return ret;
  }

  private getDefaultValue(node: JsonNode | null): ControlledTermDefaultValue | null {
    if (node == null) {
      return null;
    }
    return new ControlledTermDefaultValue(
      ReaderUtil.getURI(node, JsonSchema.termUri),
      ReaderUtil.getStringOrEmpty(node, JsonSchema.rdfsLabel),
    );
  }
}
