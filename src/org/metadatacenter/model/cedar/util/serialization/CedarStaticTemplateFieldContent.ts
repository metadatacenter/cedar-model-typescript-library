import { ReaderUtil } from '../../../../io/reader/ReaderUtil';

export class CedarStaticTemplateFieldContent {
  // This is a verbatim representation
  public static CONTEXT_VERBATIM = {
    schema: 'http://schema.org/',
    pav: 'http://purl.org/pav/',
    bibo: 'http://purl.org/ontology/bibo/',
    oslc: 'http://open-services.net/ns/core#',
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
