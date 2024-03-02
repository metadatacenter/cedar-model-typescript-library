export class Util {
  public static p(obj: object | string) {
    console.log(Util.d(obj));
  }

  public static d(obj: object | string): string {
    return JSON.stringify(obj, null, 2);
  }
}
