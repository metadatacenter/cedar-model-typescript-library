import { JsonNode } from '../../../types/basic-types/JsonNode';
import { ParsingResult } from '../../../util/compare/ParsingResult';
import { CedarJsonPath } from '../../../util/path/CedarJsonPath';
import { CedarControlledTermField } from './CedarControlledTermField';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { ValueConstraintsControlledTermField } from './ValueConstraintsControlledTermField';
import { JSONFieldTypeSpecificReader } from '../../../../../io/reader/JSONFieldTypeSpecificReader';
import { ControlledTermOntology } from './value-constraint/ontology/ControlledTermOntology';
import { ControlledTermClass } from './value-constraint/class/ControlledTermClass';
import { ControlledTermBranch } from './value-constraint/branch/ControlledTermBranch';
import { ControlledTermValueSet } from './value-constraint/value-set/ControlledTermValueSet';
import { ControlledTermDefaultValue } from './value-constraint/ControlledTermDefaultValue';
import { JsonSchema } from '../../../constants/JsonSchema';

export class JSONFieldReaderControlledTerm extends JSONFieldTypeSpecificReader {
  override read(fieldSourceObject: JsonNode, _parsingResult: ParsingResult, _path: CedarJsonPath): CedarControlledTermField {
    const field = CedarControlledTermField.buildEmptyWithNullValues();
    const uiNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.ui);
    field.valueRecommendationEnabled = ReaderUtil.getBoolean(uiNode, CedarModel.valueRecommendationEnabled);

    field.skos_altLabel = ReaderUtil.getStringList(fieldSourceObject, CedarModel.skosAltLabel);

    const vcTF = new ValueConstraintsControlledTermField();
    field.valueConstraints = vcTF;
    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      vcTF.requiredValue = ReaderUtil.getBoolean(valueConstraints, CedarModel.requiredValue);
      vcTF.ontologies = this.getOntologies(ReaderUtil.getNodeList(valueConstraints, CedarModel.ontologies));
      vcTF.classes = this.getClasses(ReaderUtil.getNodeList(valueConstraints, CedarModel.classes));
      vcTF.branches = this.getBranches(ReaderUtil.getNodeList(valueConstraints, CedarModel.branches));
      vcTF.valueSets = this.getValueSets(ReaderUtil.getNodeList(valueConstraints, CedarModel.valueSets));
      vcTF.defaultValue = this.getDefaultValue(ReaderUtil.getNodeOrNull(valueConstraints, CedarModel.defaultValue));
    }
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
        ReaderUtil.getStringOrEmpty(c, CedarModel.ValueConstraints.type),
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

  private getDefaultValue(node: JsonNode | null): ControlledTermDefaultValue | null {
    if (node == null) {
      return null;
    }
    const ret = new ControlledTermDefaultValue(
      ReaderUtil.getURI(node, JsonSchema.termUri),
      ReaderUtil.getStringOrEmpty(node, JsonSchema.rdfsLabel),
    );
    return ret;
  }
}
