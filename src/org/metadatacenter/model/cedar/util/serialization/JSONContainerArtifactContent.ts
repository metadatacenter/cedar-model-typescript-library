import { ReaderUtil } from '../../../../io/reader/ReaderUtil';
import { JsonNode } from '../../types/basic-types/JsonNode';

export class JSONContainerArtifactContent {
  // This is a verbatim representation
  public static CONTEXT_VERBATIM: JsonNode = {
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    pav: 'http://purl.org/pav/',
    bibo: 'http://purl.org/ontology/bibo/',
    oslc: 'http://open-services.net/ns/core#',
    schema: 'http://schema.org/',
    'schema:name': {
      '@type': 'xsd:string',
    },
    'schema:description': {
      '@type': 'xsd:string',
    },
    'pav:createdOn': {
      '@type': 'xsd:dateTime',
    },
    'pav:createdBy': {
      '@type': '@id',
    },
    'pav:lastUpdatedOn': {
      '@type': 'xsd:dateTime',
    },
    'oslc:modifiedBy': {
      '@type': '@id',
    },
  };

  public static CONTEXT_VERBATIM_NO_BIBO: JsonNode;

  static {
    this.CONTEXT_VERBATIM_NO_BIBO = ReaderUtil.deepClone(this.CONTEXT_VERBATIM);
    ReaderUtil.deleteNodeKey(this.CONTEXT_VERBATIM_NO_BIBO, 'bibo');
    ReaderUtil.deepFreeze(this.CONTEXT_VERBATIM_NO_BIBO);

    ReaderUtil.deepFreeze(this.CONTEXT_VERBATIM);
  }
}
