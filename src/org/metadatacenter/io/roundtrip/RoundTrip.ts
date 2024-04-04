import { JsonTemplateFieldReaderResult } from '../reader/json/JsonTemplateFieldReaderResult';
import { JsonTemplateFieldWriterInternal } from '../writer/json/JsonTemplateFieldWriterInternal';
import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { ObjectComparator } from '../../model/cedar/util/compare/ObjectComparator';
import { ChildDeploymentInfo } from '../../model/cedar/deployment/ChildDeploymentInfo';
import { JsonPath } from '../../model/cedar/util/path/JsonPath';
import { JsonTemplateReaderResult } from '../reader/json/JsonTemplateReaderResult';
import { JsonTemplateWriter } from '../writer/json/JsonTemplateWriter';
import { JsonTemplateElementReaderResult } from '../reader/json/JsonTemplateElementReaderResult';
import { JsonTemplateElementWriter } from '../writer/json/JsonTemplateElementWriter';
import { JsonWriterBehavior } from '../../behavior/JsonWriterBehavior';

export class RoundTrip {
  static compare(jsonFieldReaderResult: JsonTemplateFieldReaderResult, writer: JsonTemplateFieldWriterInternal): ParsingResult;
  static compare(jsonElementReaderResult: JsonTemplateElementReaderResult, writer: JsonTemplateElementWriter): ParsingResult;
  static compare(jsonTemplateReaderResult: JsonTemplateReaderResult, writer: JsonTemplateWriter): ParsingResult;
  static compare(left: string, right: string): ParsingResult;

  static compare(
    readerResult: JsonTemplateFieldReaderResult | JsonTemplateElementReaderResult | JsonTemplateReaderResult | string,
    writer: JsonTemplateFieldWriterInternal | JsonTemplateElementWriter | JsonTemplateWriter | string,
  ): ParsingResult {
    if (readerResult instanceof JsonTemplateFieldReaderResult && writer instanceof JsonTemplateFieldWriterInternal) {
      return this.compareField(readerResult, writer);
    } else if (readerResult instanceof JsonTemplateElementReaderResult && writer instanceof JsonTemplateElementWriter) {
      return this.compareElement(readerResult, writer);
    } else if (readerResult instanceof JsonTemplateReaderResult && writer instanceof JsonTemplateWriter) {
      return this.compareTemplate(readerResult, writer);
    } else if (typeof readerResult === 'string' && typeof writer === 'string') {
      return this.compareString(readerResult, writer);
    } else {
      throw new Error('Invalid argument types for compare method');
    }
  }

  static compareField(jsonFieldReaderResult: JsonTemplateFieldReaderResult, writer: JsonTemplateFieldWriterInternal): ParsingResult {
    const compareResult = new ParsingResult();
    ObjectComparator.compareBothWays(
      compareResult,
      jsonFieldReaderResult.fieldSourceObject,
      writer.getAsJsonNode(jsonFieldReaderResult.field, ChildDeploymentInfo.empty()),
      new JsonPath(),
      writer.getBehavior(),
    );
    return compareResult;
  }

  static compareElement(jsonElementReaderResult: JsonTemplateElementReaderResult, writer: JsonTemplateElementWriter): ParsingResult {
    const compareResult = new ParsingResult();
    ObjectComparator.compareBothWays(
      compareResult,
      jsonElementReaderResult.elementSourceObject,
      writer.getAsJsonNode(jsonElementReaderResult.element),
      new JsonPath(),
      writer.getBehavior(),
    );
    return compareResult;
  }

  static compareTemplate(jsonTemplateReaderResult: JsonTemplateReaderResult, writer: JsonTemplateWriter): ParsingResult {
    const compareResult = new ParsingResult();
    ObjectComparator.compareBothWays(
      compareResult,
      jsonTemplateReaderResult.templateSourceObject,
      writer.getAsJsonNode(jsonTemplateReaderResult.template),
      new JsonPath(),
      writer.getBehavior(),
    );
    return compareResult;
  }

  static compareString(left: string, right: string): ParsingResult {
    const leftObject = JSON.parse(left);
    const rightObject = JSON.parse(right);
    const compareResult = new ParsingResult();
    ObjectComparator.compareBothWays(compareResult, leftObject, rightObject, new JsonPath(), JsonWriterBehavior.STRICT);
    return compareResult;
  }
}
