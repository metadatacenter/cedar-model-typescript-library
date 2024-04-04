import { ReaderUtil } from '../../../../io/reader/ReaderUtil';
import { JsonNode } from '../../types/basic-types/JsonNode';

export class JsonTemplateFieldContentStatic {
  // This is a verbatim representation
  public static CONTEXT_VERBATIM: JsonNode = {
    schema: 'http://schema.org/',
    pav: 'http://purl.org/pav/',
    bibo: 'http://purl.org/ontology/bibo/',
    oslc: 'http://open-services.net/ns/core#',
  };

  public static CONTEXT_VERBATIM_NO_BIBO: JsonNode;

  static {
    ReaderUtil.deepFreeze(this.CONTEXT_VERBATIM);

    this.CONTEXT_VERBATIM_NO_BIBO = ReaderUtil.deepClone(this.CONTEXT_VERBATIM);
    ReaderUtil.deleteNodeKey(this.CONTEXT_VERBATIM_NO_BIBO, 'bibo');
    ReaderUtil.deepFreeze(this.CONTEXT_VERBATIM_NO_BIBO);
  }
}
