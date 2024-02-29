import { ReaderUtil } from '../../../reader/ReaderUtil';

export class CedarTemplateFieldContent {
  // This is a verbatim representation
  public static CONTEXT_VERBATIM = {
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    pav: 'http://purl.org/pav/',
    bibo: 'http://purl.org/ontology/bibo/',
    oslc: 'http://open-services.net/ns/core#',
    schema: 'http://schema.org/',
    skos: 'http://www.w3.org/2004/02/skos/core#',
    'schema:name': {
      '@type': 'xsd:string',
    },
    'schema:description': {
      '@type': 'xsd:string',
    },
    'skos:prefLabel': {
      '@type': 'xsd:string',
    },
    'skos:altLabel': {
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

  // This is a verbatim representation for regular fields
  public static PROPERTIES_VERBATIM_LITERAL = {
    '@type': {
      oneOf: [
        {
          type: 'string',
          format: 'uri',
        },
        {
          type: 'array',
          minItems: 1,
          items: {
            type: 'string',
            format: 'uri',
          },
          uniqueItems: true,
        },
      ],
    },
    '@value': {
      type: ['string', 'null'],
    },
    '@language': { type: ['string', 'null'], minLength: 1 },
  };

  // This is a verbatim representation for regular fields
  public static PROPERTIES_VERBATIM_CONTROLLED = {
    '@type': {
      oneOf: [
        {
          type: 'string',
          format: 'uri',
        },
        {
          type: 'array',
          minItems: 1,
          items: {
            type: 'string',
            format: 'uri',
          },
          uniqueItems: true,
        },
      ],
    },
    '@value': {
      type: ['string', 'null'],
    },
    'rdfs:label': {
      type: ['string', 'null'],
    },
    'skos:notation': {
      type: ['string', 'null'],
    },
  };

  // This is a verbatim representation for link and controlled fields
  public static PROPERTIES_VERBATIM_IRI = {
    '@type': {
      oneOf: [
        {
          type: 'string',
          format: 'uri',
        },
        {
          type: 'array',
          minItems: 1,
          items: {
            type: 'string',
            format: 'uri',
          },
          uniqueItems: true,
        },
      ],
    },
    'rdfs:label': {
      type: ['string', 'null'],
    },
    '@id': {
      type: 'string',
      format: 'uri',
    },
    'skos:notation': {
      type: ['string', 'null'],
    },
  };

  // public static PROPERTIES_FULL_KEY_LIST: Array<string> = [];
  // public static PROPERTIES_FULL_KEY_MAP: Map<string, boolean> = new Map();

  static {
    // Object.keys(CedarTemplateFieldContent.PROPERTIES_FULL).forEach((key) => {
    //   this.PROPERTIES_FULL_KEY_LIST.push(key);
    //   this.PROPERTIES_FULL_KEY_MAP.set(key, true);
    // });

    ReaderUtil.deepFreeze(this.CONTEXT_VERBATIM);
    // ReaderUtil.deepFreeze(this.PROPERTIES_FULL_KEY_LIST);
    // ReaderUtil.deepFreeze(this.PROPERTIES_FULL_KEY_MAP);
  }
}
