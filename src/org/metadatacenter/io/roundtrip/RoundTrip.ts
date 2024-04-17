import { JsonTemplateFieldReaderResult } from '../reader/json/JsonTemplateFieldReaderResult';
import { JsonTemplateFieldWriterInternal } from '../writer/json/JsonTemplateFieldWriterInternal';
import { JsonArtifactParsingResult } from '../../model/cedar/util/compare/JsonArtifactParsingResult';
import { JsonObjectComparator } from '../../model/cedar/util/compare/JsonObjectComparator';
import { ChildDeploymentInfo } from '../../model/cedar/deployment/ChildDeploymentInfo';
import { JsonPath } from '../../model/cedar/util/path/JsonPath';
import { JsonTemplateReaderResult } from '../reader/json/JsonTemplateReaderResult';
import { JsonTemplateWriter } from '../writer/json/JsonTemplateWriter';
import { JsonTemplateElementReaderResult } from '../reader/json/JsonTemplateElementReaderResult';
import { JsonTemplateElementWriter } from '../writer/json/JsonTemplateElementWriter';
import { JsonWriterBehavior } from '../../behavior/JsonWriterBehavior';

export class RoundTrip {
  static compare(jsonFieldReaderResult: JsonTemplateFieldReaderResult, writer: JsonTemplateFieldWriterInternal): JsonArtifactParsingResult;
  static compare(jsonElementReaderResult: JsonTemplateElementReaderResult, writer: JsonTemplateElementWriter): JsonArtifactParsingResult;
  static compare(jsonTemplateReaderResult: JsonTemplateReaderResult, writer: JsonTemplateWriter): JsonArtifactParsingResult;
  static compare(left: string, right: string): JsonArtifactParsingResult;

  static compare(
    readerResult: JsonTemplateFieldReaderResult | JsonTemplateElementReaderResult | JsonTemplateReaderResult | string,
    writer: JsonTemplateFieldWriterInternal | JsonTemplateElementWriter | JsonTemplateWriter | string,
  ): JsonArtifactParsingResult {
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

  static compareField(
    jsonFieldReaderResult: JsonTemplateFieldReaderResult,
    writer: JsonTemplateFieldWriterInternal,
  ): JsonArtifactParsingResult {
    const compareResult = new JsonArtifactParsingResult();
    JsonObjectComparator.compareBothWays(
      compareResult,
      jsonFieldReaderResult.fieldSourceObject,
      writer.getAsJsonNode(jsonFieldReaderResult.field, ChildDeploymentInfo.empty()),
      new JsonPath(),
      writer.getBehavior(),
    );
    return compareResult;
  }

  static compareElement(
    jsonElementReaderResult: JsonTemplateElementReaderResult,
    writer: JsonTemplateElementWriter,
  ): JsonArtifactParsingResult {
    const compareResult = new JsonArtifactParsingResult();
    JsonObjectComparator.compareBothWays(
      compareResult,
      jsonElementReaderResult.elementSourceObject,
      writer.getAsJsonNode(jsonElementReaderResult.element),
      new JsonPath(),
      writer.getBehavior(),
    );
    return compareResult;
  }

  static compareTemplate(jsonTemplateReaderResult: JsonTemplateReaderResult, writer: JsonTemplateWriter): JsonArtifactParsingResult {
    const compareResult = new JsonArtifactParsingResult();
    JsonObjectComparator.compareBothWays(
      compareResult,
      jsonTemplateReaderResult.templateSourceObject,
      writer.getAsJsonNode(jsonTemplateReaderResult.template),
      new JsonPath(),
      writer.getBehavior(),
    );
    return compareResult;
  }

  static compareString(left: string, right: string): JsonArtifactParsingResult {
    const leftObject = JSON.parse(left);
    const rightObject = JSON.parse(right);
    const compareResult = new JsonArtifactParsingResult();
    JsonObjectComparator.compareBothWays(compareResult, leftObject, rightObject, new JsonPath(), JsonWriterBehavior.STRICT);
    return compareResult;
  }
}
