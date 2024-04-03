import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { ReaderUtil } from '../ReaderUtil';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { YAMLTemplateReaderResult } from './YAMLTemplateReaderResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { YAMLReaderBehavior } from '../../../behavior/YAMLReaderBehavior';
import { YAMLElementReader } from './YAMLElementReader';
import { Template } from '../../../model/cedar/template/Template';
import YAML from 'yaml';
import { YAMLContainerArtifactReader } from './YAMLContainerArtifactReader';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';

export class YAMLTemplateReader extends YAMLContainerArtifactReader {
  private readonly elementReader: YAMLElementReader;
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.TEMPLATE;

  private constructor(behavior: YAMLReaderBehavior) {
    super(behavior);
    this.elementReader = YAMLElementReader.getForBehavior(behavior);
  }

  public static getStrict(): YAMLTemplateReader {
    return new YAMLTemplateReader(YAMLReaderBehavior.STRICT);
  }

  public static getForBehavior(behavior: YAMLReaderBehavior): YAMLTemplateReader {
    return new YAMLTemplateReader(behavior);
  }

  protected override getElementReader(): YAMLElementReader {
    return this.elementReader;
  }

  public readFromString(templateSourceString: string): YAMLTemplateReaderResult {
    let templateObject;
    try {
      templateObject = YAML.parse(templateSourceString);
    } catch (Exception) {
      templateObject = {};
    }
    return this.readFromObject(templateObject);
  }

  public readFromObject(templateSourceObject: JsonNode, topPath: JsonPath = new JsonPath()): YAMLTemplateReaderResult {
    const parsingResult: ParsingResult = new ParsingResult();
    const template = Template.buildEmptyWithNullValues();

    this.readNonReportableAttributes(template, templateSourceObject);
    this.readAnnotations(template, templateSourceObject, parsingResult, topPath);
    this.readInstanceTypeSpecification(template, templateSourceObject, parsingResult);
    this.readAndValidateChildrenInfo(template, templateSourceObject, parsingResult, topPath);

    return new YAMLTemplateReaderResult(template, parsingResult, templateSourceObject);
  }

  protected readNonReportableAttributes(template: Template, templateSourceObject: JsonNode) {
    super.readNonReportableAttributes(template, templateSourceObject);
    // Read template-only properties
    template.header = ReaderUtil.getString(templateSourceObject, YamlKeys.header);
    template.footer = ReaderUtil.getString(templateSourceObject, YamlKeys.footer);
  }

  private readInstanceTypeSpecification(template: Template, templateSourceObject: JsonNode, _parsingResult: ParsingResult) {
    const properties: JsonNode = ReaderUtil.getNode(templateSourceObject, JsonSchema.properties);
    if (properties !== null) {
      const atType: JsonNode = ReaderUtil.getNode(properties, JsonSchema.atType);
      if (atType !== null) {
        const oneOf: Array<JsonNode> = ReaderUtil.getNodeList(atType, JsonSchema.oneOf);
        if (oneOf !== null) {
          oneOf.forEach((item) => {
            const oneOfEnum = ReaderUtil.getStringList(item, JsonSchema.enum);
            if (oneOfEnum != null && oneOfEnum.length > 0) {
              template.instanceTypeSpecification = oneOfEnum[0];
            }
          });
        }
      }
    }
  }
}
