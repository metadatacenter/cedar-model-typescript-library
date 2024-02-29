import { CedarContainerChildInfo } from './CedarContainerChildInfo';

export class CedarContainerChildrenInfo {
  private _children: Array<CedarContainerChildInfo> = [];
  private nameMap = new Map<string, CedarContainerChildInfo>();

  add(childInfo: CedarContainerChildInfo) {
    this._children.push(childInfo);
    this.nameMap.set(childInfo.name, childInfo);
  }

  get children(): Array<CedarContainerChildInfo> {
    return this._children;
  }

  has(name: string) {
    return this.nameMap.has(name);
  }

  get(name: string) {
    return this.nameMap.get(name);
  }
}
