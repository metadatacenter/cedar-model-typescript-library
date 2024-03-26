import { JSONFieldReaderResult } from '../reader/JSONFieldReaderResult';
import { JSONTemplateFieldWriterInternal } from '../writer/JSONTemplateFieldWriterInternal';
import { ParsingResult } from '../../model/cedar/util/compare/ParsingResult';
import { ObjectComparator } from '../../model/cedar/util/compare/ObjectComparator';
import { ChildDeploymentInfo } from '../../model/cedar/deployment/ChildDeploymentInfo';
import { JsonPath } from '../../model/cedar/util/path/JsonPath';
import { JSONTemplateReaderResult } from '../reader/JSONTemplateReaderResult';
import { JSONTemplateWriter } from '../writer/JSONTemplateWriter';
import { JSONElementReaderResult } from '../reader/JSONElementReaderResult';
import { JSONTemplateElementWriter } from '../writer/JSONTemplateElementWriter';

export class RoundTrip {
  static compare(jsonFieldReaderResult: JSONFieldReaderResult, writer: JSONTemplateFieldWriterInternal): ParsingResult;
  static compare(jsonElementReaderResult: JSONElementReaderResult, writer: JSONTemplateElementWriter): ParsingResult;
  static compare(jsonTemplateReaderResult: JSONTemplateReaderResult, writer: JSONTemplateWriter): ParsingResult;

  static compare(
    readerResult: JSONFieldReaderResult | JSONElementReaderResult | JSONTemplateReaderResult,
    writer: JSONTemplateFieldWriterInternal | JSONTemplateElementWriter | JSONTemplateWriter,
  ): ParsingResult {
    if (readerResult instanceof JSONFieldReaderResult && writer instanceof JSONTemplateFieldWriterInternal) {
      return this.compareField(readerResult, writer);
    } else if (readerResult instanceof JSONElementReaderResult && writer instanceof JSONTemplateElementWriter) {
      return this.compareElement(readerResult, writer);
    } else if (readerResult instanceof JSONTemplateReaderResult && writer instanceof JSONTemplateWriter) {
      return this.compareTemplate(readerResult, writer);
    } else {
      throw new Error('Invalid argument types for compare method');
    }
  }

  static compareField(jsonFieldReaderResult: JSONFieldReaderResult, writer: JSONTemplateFieldWriterInternal): ParsingResult {
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

  static compareElement(jsonElementReaderResult: JSONElementReaderResult, writer: JSONTemplateElementWriter): ParsingResult {
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
}
