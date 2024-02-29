import { CedarModel } from '../../CedarModel';
import { ReaderUtil } from '../../../../reader/ReaderUtil';
import { Node } from '../../types/Node';

export class CedarTemplateUI {
  private order: Array<string> = [];
  private propertyLabels: Map<string, string> = new Map();
  private propertyDescriptions: Map<string, string> = new Map();

  private constructor() {}

  public static EMPTY = new CedarTemplateUI();

  toJSON() {
    return {
      order: [...this.order],
      propertyLabels: Object.fromEntries(this.propertyLabels),
      propertyDescriptions: Object.fromEntries(this.propertyDescriptions),
    };
  }

  static fromNode(obj: Node): CedarTemplateUI {
    const r = new CedarTemplateUI();
    if (Object.hasOwn(obj, CedarModel.order)) {
      r.order = ReaderUtil.getStringList(obj, CedarModel.order);
    }
    if (Object.hasOwn(obj, CedarModel.propertyLabels)) {
      r.propertyLabels = ReaderUtil.getStringMap(obj, CedarModel.propertyLabels);
    }
    if (Object.hasOwn(obj, CedarModel.propertyDescriptions)) {
      r.propertyDescriptions = ReaderUtil.getStringMap(obj, CedarModel.propertyDescriptions);
    }
    return r;
  }
}
