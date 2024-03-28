import * as fs from 'fs';
import * as path from 'path';
import { TestResource } from './TestResource';

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
    return fileContent.trim();
  }

  static readOutsideResourceAsString(resourceFolder: string, fileName: string): string {
    const projectRoot = process.cwd();
    const filePath = path.join(projectRoot, resourceFolder, fileName);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent;
  }

  static readTestJson(testResource: TestResource): string {
    return this.readTestResourceAsString(testResource.getDirectory(), testResource.getFile('-input.json'));
  }

  static readReferenceYaml(testResource: TestResource): string {
    return this.readTestResourceAsString(testResource.getDirectory(), testResource.getFile('-ref-ts-lib.yaml'));
  }
}
