import * as fs from 'fs';
import * as path from 'path';

export class TestUtil {
  public static raw(obj: object | string | undefined) {
    console.log(obj);
  }

  public static p(obj: object | string | null | undefined) {
    console.log(TestUtil.d(obj));
  }

  public static d(obj: object | string | null | undefined): string {
    return JSON.stringify(obj, null, 2);
  }

  static readTestResourceAsString(resourceFolder: string, fileName: string): string {
    const projectRoot = process.cwd();
    const filePath = path.join(projectRoot, 'test', 'resources', resourceFolder, fileName);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent;
  }

  static readOutsideResourceAsString(resourceFolder: string, fileName: string): string {
    const projectRoot = process.cwd();
    const filePath = path.join(projectRoot, resourceFolder, fileName);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent;
  }
}
