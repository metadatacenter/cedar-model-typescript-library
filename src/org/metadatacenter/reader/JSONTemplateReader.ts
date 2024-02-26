import {CedarTemplate} from "../model/CedarTemplate";

export class JSONTemplateReader {
  static readFromString(templateSourceString: String): CedarTemplate {
    const template = new CedarTemplate();
    console.log('JSONTemplateReader.readFromString');
    return template;
  }

  static readFromObject(templateSourceObject: Object): CedarTemplate {
    const template = new CedarTemplate();
    console.log('JSONTemplateReader.readFromObject');
    return template;
  }

}
