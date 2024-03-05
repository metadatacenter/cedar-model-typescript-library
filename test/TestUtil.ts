import * as fs from 'fs';
import * as path from 'path';

export class TestUtil {
  public static p(obj: object | string) {
    console.log(TestUtil.d(obj));
  }

  public static d(obj: object | string): string {
    return JSON.stringify(obj, null, 2);
  }

  static readTestResourceAsString(resourceFolder: string, fileName: string): string {
    const projectRoot = process.cwd();
    const filePath = path.join(projectRoot, 'test', 'resources', resourceFolder, fileName);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent;
  }
}
