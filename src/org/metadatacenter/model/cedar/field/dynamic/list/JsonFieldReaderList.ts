import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { ReaderUtil } from '../../../../../io/reader/ReaderUtil';
import { CedarModel } from '../../../constants/CedarModel';
import { JsonTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JsonTemplateFieldTypeSpecificReader';
import { ListField } from './ListField';
import { ListOption } from './ListOption';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { MultipleChoiceListFieldImpl } from '../list-multiple-choice/MultipleChoiceListFieldImpl';
import { SingleChoiceListFieldImpl } from '../list-single-choice/SingleChoiceListFieldImpl';

export class JsonFieldReaderList extends JsonTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    _parsingResult: JsonArtifactParsingResult,
    _path: JsonPath,
  ): ListField {
    let field: ListField = SingleChoiceListFieldImpl.buildEmpty();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);

    const valueConstraints: JsonNode = ReaderUtil.getNode(fieldSourceObject, CedarModel.valueConstraints);
    if (valueConstraints != null) {
      // Whether several options can be picked at once is what `multipleChoice` says, wherever the
      // field sits. A child field took it from the property's cardinality instead — how many instances
      // of the field there are, which is a different question — so a list offering one option, written
      // as a repeatable field, was read as a multi-select and written back with `multipleChoice: true`
      // over the `false` its template declared. The Java library reads the declared value, and this
      // follows it.
      const multipleChoice: boolean = ReaderUtil.getBoolean(valueConstraints, CedarModel.multipleChoice);
      if (multipleChoice) {
        field = MultipleChoiceListFieldImpl.buildEmpty();
      }
      field.valueConstraints.defaultValue = ReaderUtil.getString(valueConstraints, CedarModel.defaultValue);
      const literals: Array<JsonNode> = ReaderUtil.getNodeList(valueConstraints, CedarModel.literals);
      if (literals !== null) {
        literals.forEach((literal) => {
          const label = ReaderUtil.getString(literal, CedarModel.label);
          const selectedByDefault = ReaderUtil.getBoolean(literal, CedarModel.selectedByDefault);
          if (label != null) {
            const option = new ListOption(label, selectedByDefault);
            field.valueConstraints.literals.push(option);
          }
        });
      }
    }
    return field;
  }
}
