import { ReaderUtil } from '../../../../io/reader/ReaderUtil';
import { JsonNode } from '../../types/basic-types/JsonNode';

export class JsonTemplateInstanceContent {
  // This is a verbatim representation
  public static CONTEXT_VERBATIM: JsonNode = {
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    pav: 'http://purl.org/pav/',
    schema: 'http://schema.org/',
    oslc: 'http://open-services.net/ns/core#',
    skos: 'http://www.w3.org/2004/02/skos/core#',
    'rdfs:label': {
      '@type': 'xsd:string',
    },
    'schema:isBasedOn': {
      '@type': '@id',
    },
    'schema:name': {
      '@type': 'xsd:string',
    },
    'schema:description': {
      '@type': 'xsd:string',
    },
    'pav:derivedFrom': {
      '@type': '@id',
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
    'skos:notation': {
      '@type': 'xsd:string',
    },
  };

  static {
    ReaderUtil.deepFreeze(this.CONTEXT_VERBATIM);
  }
}
