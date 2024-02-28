// Template with one text field, before first save
export const templateObjectSource01 = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  '@id': null,
  '@type': 'https://schema.metadatacenter.org/core/Template',
  '@context': {
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
  },
  type: 'object',
  title: 'Untitled template schema',
  description: 'Untitled template schema generated by the CEDAR Template Editor 2.6.54',
  _ui: {
    pages: [],
    order: ['Textfield'],
    propertyLabels: {
      Textfield: 'Textfield',
    },
    propertyDescriptions: {
      Textfield: 'Help Text',
    },
  },
  properties: {
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
        Textfield: {
          enum: ['https://schema.metadatacenter.org/properties/fac2de3a-937e-4573-810a-c1653e658cde'],
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
    Textfield: {
      $schema: 'http://json-schema.org/draft-04/schema#',
      '@id': 'tmp-1708998934299-6744386',
      '@type': 'https://schema.metadatacenter.org/core/TemplateField',
      '@context': {
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
      },
      type: 'object',
      title: 'Textfield field schema',
      description: 'Textfield field schema generated by the CEDAR Template Editor 2.6.54',
      _ui: {
        inputType: 'textfield',
      },
      _valueConstraints: {
        requiredValue: false,
      },
      properties: {
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
      },
      required: ['@value'],
      'schema:name': 'Textfield',
      'schema:description': 'Help Text',
      'pav:createdOn': null,
      'pav:createdBy': null,
      'pav:lastUpdatedOn': null,
      'oslc:modifiedBy': null,
      'schema:schemaVersion': '1.6.0',
      additionalProperties: false,
    },
  },
  required: [
    '@context',
    '@id',
    'schema:isBasedOn',
    'schema:name',
    'schema:description',
    'pav:createdOn',
    'pav:createdBy',
    'pav:lastUpdatedOn',
    'oslc:modifiedBy',
    'Textfield',
  ],
  'schema:name': 'Untitled',
  'schema:description': 'Untitled description',
  'pav:createdOn': null,
  'pav:createdBy': null,
  'pav:lastUpdatedOn': null,
  'oslc:modifiedBy': null,
  'schema:schemaVersion': '1.6.0',
  additionalProperties: false,
  'pav:version': '0.0.1',
  'bibo:status': 'bibo:draft',
};

export const templateStringSource01 = JSON.stringify(templateObjectSource01);
