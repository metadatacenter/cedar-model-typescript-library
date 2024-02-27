import { CedarTemplate } from '../model/cedar/template/CedarTemplate';
import { CedarSchema } from '../model/cedar/template/beans/CedarSchema';
import { CedarModel } from '../model/cedar/CedarModel';
import { JsonSchema } from '../model/cedar/constants/JsonSchema';
import { CedarArtifactType } from '../model/cedar/template/beans/CedarArtifactTypeValue';
import { JavascriptType } from '../model/cedar/template/beans/JavascriptType';

interface Node {
  [key: string]: string | boolean | object | null | undefined;
}
export class JSONTemplateReader {
  static readFromString(templateSourceString: string): CedarTemplate {
    let templateObject;
    try {
      templateObject = JSON.parse(templateSourceString);
    } catch (Exception) {
      templateObject = {};
    }
    return this.readFromObject(templateObject);
  }

  static readFromObject(templateSourceObject: Node): CedarTemplate {
    const template = new CedarTemplate();
    template.$schema = CedarSchema.forValue(this.getString(templateSourceObject, CedarModel.schema));
    template.at_id = this.getString(templateSourceObject, JsonSchema.atId);
    template.at_type = CedarArtifactType.forValue(this.getString(templateSourceObject, JsonSchema.atType));
    template.type = JavascriptType.forValue(this.getString(templateSourceObject, CedarModel.type));
    //console.log(templateSourceObject);
    //console.log(JSON.stringify(template, null, 2));
    return template;
  }

  private static getString(node: Node, key: string): string | null {
    if (Object.hasOwn(node, key)) {
      return (node[key] ?? null) as string;
    } else {
      return null;
    }
  }
}
