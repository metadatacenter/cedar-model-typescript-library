import { ReaderUtil } from '../../../../io/reader/ReaderUtil';
import { JsonNode } from '../../types/basic-types/JsonNode';

export class JSONTemplateContent {
  // This will have the names of elements and fields as well
  public static REQUIRED_PARTIAL = [
    '@context',
    '@id',
    'schema:isBasedOn',
    'schema:name',
    'schema:description',
    'pav:createdOn',
    'pav:createdBy',
    'pav:lastUpdatedOn',
    'oslc:modifiedBy',
  ];

  // @context/properties will have the Property IRI Mappings
  // Also will contain the definitions of the included fields and elements
  public static PROPERTIES_PARTIAL: JsonNode = {
    '@context': {
      type: 'object',
      properties: {
        rdfs: {
          type: 'string',
          format: 'uri',
          enum: ['http://www.w3.org/2000/01/rdf-schema#'],
        },
        xsd: {
          type: 'string',
          format: 'uri',
          enum: ['http://www.w3.org/2001/XMLSchema#'],
        },
        pav: {
          type: 'string',
          format: 'uri',
          enum: ['http://purl.org/pav/'],
        },
        schema: {
          type: 'string',
          format: 'uri',
          enum: ['http://schema.org/'],
        },
        oslc: {
          type: 'string',
          format: 'uri',
          enum: ['http://open-services.net/ns/core#'],
        },
        skos: {
          type: 'string',
          format: 'uri',
          enum: ['http://www.w3.org/2004/02/skos/core#'],
        },
        'rdfs:label': {
          type: 'object',
          properties: {
            '@type': {
              type: 'string',
              enum: ['xsd:string'],
            },
          },
        },
        'schema:isBasedOn': {
          type: 'object',
          properties: {
            '@type': {
              type: 'string',
              enum: ['@id'],
            },
          },
        },
        'schema:name': {
          type: 'object',
          properties: {
            '@type': {
              type: 'string',
              enum: ['xsd:string'],
            },
          },
        },
        'schema:description': {
          type: 'object',
          properties: {
            '@type': {
              type: 'string',
              enum: ['xsd:string'],
            },
          },
        },
        'pav:derivedFrom': {
          type: 'object',
          properties: {
            '@type': {
              type: 'string',
              enum: ['@id'],
            },
          },
        },
        'pav:createdOn': {
          type: 'object',
          properties: {
            '@type': {
              type: 'string',
              enum: ['xsd:dateTime'],
            },
          },
        },
        'pav:createdBy': {
          type: 'object',
          properties: {
            '@type': {
              type: 'string',
              enum: ['@id'],
            },
          },
        },
        'pav:lastUpdatedOn': {
          type: 'object',
          properties: {
            '@type': {
              type: 'string',
              enum: ['xsd:dateTime'],
            },
          },
        },
        'oslc:modifiedBy': {
          type: 'object',
          properties: {
            '@type': {
              type: 'string',
              enum: ['@id'],
            },
          },
        },
        'skos:notation': {
          type: 'object',
          properties: {
            '@type': {
              type: 'string',
              enum: ['xsd:string'],
            },
          },
        },
      },
      required: [
        'xsd',
        'pav',
        'schema',
        'oslc',
        'schema:isBasedOn',
        'schema:name',
        'schema:description',
        'pav:createdOn',
        'pav:createdBy',
        'pav:lastUpdatedOn',
        'oslc:modifiedBy',
      ],
      additionalProperties: false,
    },
    '@id': {
      type: ['string', 'null'],
      format: 'uri',
    },
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
    'schema:isBasedOn': {
      type: 'string',
      format: 'uri',
    },
    'schema:name': {
      type: 'string',
      minLength: 1,
    },
    'schema:description': {
      type: 'string',
    },
    'pav:derivedFrom': {
      type: 'string',
      format: 'uri',
    },
    'pav:createdOn': {
      type: ['string', 'null'],
      format: 'date-time',
    },
    'pav:createdBy': {
      type: ['string', 'null'],
      format: 'uri',
    },
    'pav:lastUpdatedOn': {
      type: ['string', 'null'],
      format: 'date-time',
    },
    'oslc:modifiedBy': {
      type: ['string', 'null'],
      format: 'uri',
    },
  };

  public static REQUIRED_PARTIAL_KEY_MAP: Map<string, boolean>;
  public static PROPERTIES_PARTIAL_KEY_LIST: Array<string> = [];
  public static PROPERTIES_PARTIAL_KEY_MAP: Map<string, boolean> = new Map();
  public static CONTEXT_VERBATIM_NO_BIBO: JsonNode;

  static {
    Object.keys(JSONTemplateContent.PROPERTIES_PARTIAL).forEach((key) => {
      this.PROPERTIES_PARTIAL_KEY_LIST.push(key);
      this.PROPERTIES_PARTIAL_KEY_MAP.set(key, true);
    });
    this.REQUIRED_PARTIAL_KEY_MAP = this.REQUIRED_PARTIAL.reduce((acc, current) => {
      acc.set(current, true);
      return acc;
    }, new Map<string, boolean>());

    ReaderUtil.deepFreeze(this.REQUIRED_PARTIAL);
    ReaderUtil.deepFreeze(this.PROPERTIES_PARTIAL);
    ReaderUtil.deepFreeze(this.REQUIRED_PARTIAL_KEY_MAP);
    ReaderUtil.deepFreeze(this.PROPERTIES_PARTIAL_KEY_LIST);
    ReaderUtil.deepFreeze(this.PROPERTIES_PARTIAL_KEY_MAP);
  }
}
