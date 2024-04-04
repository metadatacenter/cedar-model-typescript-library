import { JsonSchema } from '../../../model/cedar/constants/JsonSchema';
import { CedarArtifactType } from '../../../model/cedar/types/cedar-types/CedarArtifactType';
import { ReaderUtil } from '../ReaderUtil';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { ParsingResult } from '../../../model/cedar/util/compare/ParsingResult';
import { YamlTemplateReaderResult } from './YamlTemplateReaderResult';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { YamlReaderBehavior } from '../../../behavior/YamlReaderBehavior';
import { YamlTemplateElementReader } from './YamlTemplateElementReader';
import { Template } from '../../../model/cedar/template/Template';
import YAML from 'yaml';
import { YamlContainerArtifactReader } from './YamlContainerArtifactReader';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';

export class YamlTemplateReader extends YamlContainerArtifactReader {
  private readonly elementReader: YamlTemplateElementReader;
  protected knownArtifactType: CedarArtifactType = CedarArtifactType.TEMPLATE;

  private constructor(behavior: YamlReaderBehavior) {
    super(behavior);
    this.elementReader = YamlTemplateElementReader.getForBehavior(behavior);
  }

  public static getStrict(): YamlTemplateReader {
    return new YamlTemplateReader(YamlReaderBehavior.STRICT);
  }

  public static getForBehavior(behavior: YamlReaderBehavior): YamlTemplateReader {
    return new YamlTemplateReader(behavior);
  }

  protected override getElementReader(): YamlTemplateElementReader {
    return this.elementReader;
  }

  public readFromString(templateSourceString: string): YamlTemplateReaderResult {
    let templateObject;
    try {
      templateObject = YAML.parse(templateSourceString);
    } catch (Exception) {
      templateObject = {};
    }
    return this.readFromObject(templateObject);
  }

  public readFromObject(templateSourceObject: JsonNode, topPath: JsonPath = new JsonPath()): YamlTemplateReaderResult {
    const parsingResult: ParsingResult = new ParsingResult();
    const template = Template.buildEmptyWithNullValues();

    this.readNonReportableAttributes(template, templateSourceObject);
    this.readAnnotations(template, templateSourceObject, parsingResult, topPath);
    this.readInstanceTypeSpecification(template, templateSourceObject, parsingResult);
    this.readAndValidateChildrenInfo(template, templateSourceObject, parsingResult, topPath);

    return new YamlTemplateReaderResult(template, parsingResult, templateSourceObject);
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
