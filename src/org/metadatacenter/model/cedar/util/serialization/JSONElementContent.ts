import { ReaderUtil } from '../../../../io/reader/ReaderUtil';
import { JsonNode } from '../../types/basic-types/JsonNode';

export class JSONElementContent {
  // This will have the names of elements and fields as well
  public static REQUIRED_PARTIAL = ['@context', '@id'];

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

  // @context/properties will have the Property IRI Mappings
  // Also will contain the definitions of the included fields and elements
  public static PROPERTIES_PARTIAL: JsonNode = {
    '@context': {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
    '@id': {
      type: 'string',
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
  };

  public static REQUIRED_PARTIAL_KEY_MAP: Map<string, boolean>;
  public static PROPERTIES_PARTIAL_KEY_MAP: Map<string, boolean> = new Map();

  static {
    Object.keys(JSONElementContent.PROPERTIES_PARTIAL).forEach((key) => {
      this.PROPERTIES_PARTIAL_KEY_MAP.set(key, true);
    });
    this.REQUIRED_PARTIAL_KEY_MAP = this.REQUIRED_PARTIAL.reduce((acc, current) => {
      acc.set(current, true);
      return acc;
    }, new Map<string, boolean>());

    ReaderUtil.deepFreeze(this.REQUIRED_PARTIAL);
    ReaderUtil.deepFreeze(this.CONTEXT_VERBATIM);
    ReaderUtil.deepFreeze(this.PROPERTIES_PARTIAL);
    ReaderUtil.deepFreeze(this.REQUIRED_PARTIAL_KEY_MAP);
    ReaderUtil.deepFreeze(this.PROPERTIES_PARTIAL_KEY_MAP);
  }
}
