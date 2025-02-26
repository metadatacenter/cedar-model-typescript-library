import { JsonNode } from '../../../types/basic-types/JsonNode';
import { JsonArtifactParsingResult } from '../../../util/compare/JsonArtifactParsingResult';
import { JsonPath } from '../../../util/path/JsonPath';
import { JsonTemplateFieldTypeSpecificReader } from '../../../../../io/reader/json/JsonTemplateFieldTypeSpecificReader';
import { ChildDeploymentInfo } from '../../../deployment/ChildDeploymentInfo';
import { ExtOrcidField } from './ExtOrcidField';
import { ExtOrcidFieldImpl } from './ExtOrcidFieldImpl';

export class JsonFieldReaderExtOrcid extends JsonTemplateFieldTypeSpecificReader {
  override read(
    fieldSourceObject: JsonNode,
    childInfo: ChildDeploymentInfo,
    _parsingResult: JsonArtifactParsingResult,
    _path: JsonPath,
  ): ExtOrcidField {
    const field = ExtOrcidFieldImpl.buildEmpty();
    this.readRequiredAndHidden(fieldSourceObject, childInfo);
    return field;
  }
}
