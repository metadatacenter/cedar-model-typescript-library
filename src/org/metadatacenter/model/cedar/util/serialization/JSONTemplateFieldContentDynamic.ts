import { ReaderUtil } from '../../../../io/reader/ReaderUtil';
import { JsonNode } from '../../types/basic-types/JsonNode';
import { JsonSchema } from '../../constants/JsonSchema';

export class JSONTemplateFieldContentDynamic {
  // This is a verbatim representation
  public static CONTEXT_VERBATIM: JsonNode = {
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
  public static PROPERTIES_VERBATIM_LITERAL: JsonNode = {
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
    'rdfs:label': {
      type: ['string', 'null'],
    },
  };

  // This is a verbatim representation for controlled fields
  public static PROPERTIES_VERBATIM_CONTROLLED: JsonNode = {
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
    '@id': {
      type: 'string',
      format: 'uri',
    },
    'rdfs:label': {
      type: ['string', 'null'],
    },
    'skos:notation': {
      type: ['string', 'null'],
    },
  };

  // This is a verbatim representation for link and controlled fields
  public static PROPERTIES_VERBATIM_IRI: JsonNode = {
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
    '@id': {
      type: 'string',
      format: 'uri',
    },
    'rdfs:label': {
      type: ['string', 'null'],
    },
    'skos:notation': {
      type: ['string', 'null'],
    },
  };

  // This is a verbatim representation for numeric fields
  public static PROPERTIES_VERBATIM_NUMERIC: JsonNode = {
    '@value': {
      type: ['string', 'null'],
    },
    'rdfs:label': {
      type: ['string', 'null'],
    },
    '@type': {
      type: 'string',
      format: 'uri',
    },
  };

  // This content goes into the container additionalProperties in case of an attribute-value field
  public static ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE_OUTSIDE: JsonNode = {
    type: 'object',
    properties: {
      '@value': {
        type: ['string', 'null'],
      },
      '@type': {
        type: 'string',
        format: 'uri',
      },
    },
    required: ['@value'],
    additionalProperties: false,
  };

  public static ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE_INSIDE: JsonNode = {
    type: 'string',
    format: 'uri',
  };

  public static PROPERTIES_VERBATIM_LITERAL_NO_AT_LANGUAGE: JsonNode;

  static {
    ReaderUtil.deepFreeze(this.CONTEXT_VERBATIM);
    ReaderUtil.deepFreeze(this.PROPERTIES_VERBATIM_LITERAL);

    this.PROPERTIES_VERBATIM_LITERAL_NO_AT_LANGUAGE = ReaderUtil.deepClone(this.PROPERTIES_VERBATIM_LITERAL);
    ReaderUtil.deleteNodeKey(this.PROPERTIES_VERBATIM_LITERAL_NO_AT_LANGUAGE, JsonSchema.atLanguage);
    ReaderUtil.deepFreeze(this.PROPERTIES_VERBATIM_LITERAL_NO_AT_LANGUAGE);

    ReaderUtil.deepFreeze(this.PROPERTIES_VERBATIM_CONTROLLED);
    ReaderUtil.deepFreeze(this.PROPERTIES_VERBATIM_IRI);
    ReaderUtil.deepFreeze(this.PROPERTIES_VERBATIM_NUMERIC);
    ReaderUtil.deepFreeze(this.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE_OUTSIDE);
    ReaderUtil.deepFreeze(this.ADDITIONAL_PROPERTIES_VERBATIM_ATTRIBUTE_VALUE_INSIDE);
  }
}
