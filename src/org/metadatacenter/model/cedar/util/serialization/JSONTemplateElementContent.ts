import { ReaderUtil } from '../../../../io/reader/ReaderUtil';
import { JsonNode } from '../../types/basic-types/JsonNode';

export class JSONTemplateElementContent {
  // This will have the names of elements and fields as well
  public static REQUIRED_PARTIAL = ['@context', '@id'];

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
  public static CONTEXT_VERBATIM_NO_BIBO: JsonNode;

  static {
    Object.keys(JSONTemplateElementContent.PROPERTIES_PARTIAL).forEach((key) => {
      this.PROPERTIES_PARTIAL_KEY_MAP.set(key, true);
    });
    this.REQUIRED_PARTIAL_KEY_MAP = this.REQUIRED_PARTIAL.reduce((acc, current) => {
      acc.set(current, true);
      return acc;
    }, new Map<string, boolean>());

    ReaderUtil.deepFreeze(this.REQUIRED_PARTIAL);
    ReaderUtil.deepFreeze(this.PROPERTIES_PARTIAL);
    ReaderUtil.deepFreeze(this.REQUIRED_PARTIAL_KEY_MAP);
    ReaderUtil.deepFreeze(this.PROPERTIES_PARTIAL_KEY_MAP);
  }
}
