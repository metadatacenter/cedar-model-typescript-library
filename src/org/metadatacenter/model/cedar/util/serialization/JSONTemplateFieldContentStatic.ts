import { ReaderUtil } from '../../../../io/reader/ReaderUtil';
import { JsonNode } from '../../types/basic-types/JsonNode';

export class JSONTemplateFieldContentStatic {
  // This is a verbatim representation
  public static CONTEXT_VERBATIM: JsonNode = {
    schema: 'http://schema.org/',
    pav: 'http://purl.org/pav/',
    bibo: 'http://purl.org/ontology/bibo/',
    oslc: 'http://open-services.net/ns/core#',
  };

  static {
    ReaderUtil.deepFreeze(this.CONTEXT_VERBATIM);
  }
}
