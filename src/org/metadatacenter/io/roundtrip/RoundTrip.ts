import { JSONTemplateFieldReaderResult } from '../reader/json/JSONTemplateFieldReaderResult';
import { JSONTemplateFieldWriterInternal } from '../writer/json/JSONTemplateFieldWriterInternal';
import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { ObjectComparator } from '../../model/cedar/util/compare/ObjectComparator';
import { ChildDeploymentInfo } from '../../model/cedar/deployment/ChildDeploymentInfo';
import { JsonPath } from '../../model/cedar/util/path/JsonPath';
import { JSONTemplateReaderResult } from '../reader/json/JSONTemplateReaderResult';
import { JSONTemplateWriter } from '../writer/json/JSONTemplateWriter';
import { JSONTemplateElementReaderResult } from '../reader/json/JSONTemplateElementReaderResult';
import { JSONTemplateElementWriter } from '../writer/json/JSONTemplateElementWriter';
import { JSONWriterBehavior } from '../../behavior/JSONWriterBehavior';

export class RoundTrip {
  static compare(jsonFieldReaderResult: JSONTemplateFieldReaderResult, writer: JSONTemplateFieldWriterInternal): ParsingResult;
  static compare(jsonElementReaderResult: JSONTemplateElementReaderResult, writer: JSONTemplateElementWriter): ParsingResult;
  static compare(jsonTemplateReaderResult: JSONTemplateReaderResult, writer: JSONTemplateWriter): ParsingResult;
  static compare(left: string, right: string): ParsingResult;

  static compare(
    readerResult: JSONTemplateFieldReaderResult | JSONTemplateElementReaderResult | JSONTemplateReaderResult | string,
    writer: JSONTemplateFieldWriterInternal | JSONTemplateElementWriter | JSONTemplateWriter | string,
  ): ParsingResult {
    if (readerResult instanceof JSONTemplateFieldReaderResult && writer instanceof JSONTemplateFieldWriterInternal) {
      return this.compareField(readerResult, writer);
    } else if (readerResult instanceof JSONTemplateElementReaderResult && writer instanceof JSONTemplateElementWriter) {
      return this.compareElement(readerResult, writer);
    } else if (readerResult instanceof JSONTemplateReaderResult && writer instanceof JSONTemplateWriter) {
      return this.compareTemplate(readerResult, writer);
    } else if (typeof readerResult === 'string' && typeof writer === 'string') {
      return this.compareString(readerResult, writer);
    } else {
      throw new Error('Invalid argument types for compare method');
    }
  }

  static compareField(jsonFieldReaderResult: JSONTemplateFieldReaderResult, writer: JSONTemplateFieldWriterInternal): ParsingResult {
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

  static compareElement(jsonElementReaderResult: JSONTemplateElementReaderResult, writer: JSONTemplateElementWriter): ParsingResult {
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

  static compareTemplate(jsonTemplateReaderResult: JSONTemplateReaderResult, writer: JSONTemplateWriter): ParsingResult {
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
    ObjectComparator.compareBothWays(compareResult, leftObject, rightObject, new JsonPath(), JSONWriterBehavior.STRICT);
    return compareResult;
  }
}
