import { ReaderUtil } from '../../../../io/reader/ReaderUtil';
import { JsonNode } from '../../types/basic-types/JsonNode';

export class JsonTemplateElementContent {
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
    // As a template types its own instance's `@id`. An occurrence of this element has no identity
    // until the instance is uploaded, and null is what a document carries meanwhile; typed as a bare
    // string, the template refused a draft the server itself would fill. A document typed the older
    // way reads as it always did — see `acceptEitherIdTyping`.
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
  };

  /**
   * The `@id` typing a stored element carries, which is not the one written now.
   *
   * An occurrence has no identity until its instance is uploaded, so a template written since the
   * server took that over types the key `["string", "null"]`. Everything written before types it
   * `"string"`, and both are documents this library has to read: nothing rewrites a stored artifact,
   * and an artifact is not wrong for predating a rule. A reader accepts either; only a writer moves.
   */
  public static readonly LEGACY_ID_TYPING: JsonNode = {
    type: 'string',
    format: 'uri',
  };

  /**
   * The blueprint, with the `@id` typing the document actually carries.
   *
   * Comparison is verbatim, so the blueprint has to name the accepted form the document chose, or a
   * stored element reads as departing from the model for a key it types exactly as it was told to.
   */
  public static acceptEitherIdTyping(blueprint: JsonNode, documentProperties: JsonNode): void {
    const stated = ReaderUtil.getNode(documentProperties, '@id');
    if (stated !== null && JSON.stringify(stated) === JSON.stringify(JsonTemplateElementContent.LEGACY_ID_TYPING)) {
      blueprint['@id'] = ReaderUtil.deepClone(JsonTemplateElementContent.LEGACY_ID_TYPING) as JsonNode;
    }
  }

  public static REQUIRED_PARTIAL_KEY_MAP: Map<string, boolean>;
  public static PROPERTIES_PARTIAL_KEY_MAP: Map<string, boolean> = new Map();
  public static CONTEXT_VERBATIM_NO_BIBO: JsonNode;

  static {
    Object.keys(JsonTemplateElementContent.PROPERTIES_PARTIAL).forEach((key) => {
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
