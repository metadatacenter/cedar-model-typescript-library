import { ReaderUtil } from '../../../../io/reader/ReaderUtil';
import { JsonNode } from '../../types/basic-types/JsonNode';

export class JsonTemplateInstanceContent {
  // This is a verbatim representation
  public static CONTEXT_VERBATIM: JsonNode = {
    schema: 'http://schema.org/',
    pav: 'http://purl.org/pav/',
    oslc: 'http://open-services.net/ns/core#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    skos: 'http://www.w3.org/2004/02/skos/core#',
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
    'pav:derivedFrom': {
      '@type': '@id',
    },
    'schema:isBasedOn': {
      '@type': '@id',
    },
  };

  static {
    ReaderUtil.deepFreeze(this.CONTEXT_VERBATIM);
  }
}
