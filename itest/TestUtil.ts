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

  static readTestResourceAsString(fileName: string): string {
    const projectRoot = process.cwd();
    const filePath = path.join(projectRoot, 'test', 'resources', fileName);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent;
  }

  static readOutsideResourceAsString(resourceFolder: string, fileName: string): string {
    const projectRoot = process.cwd();
    const filePath = path.join(projectRoot, resourceFolder, fileName);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent;
  }

  static writeOutsideResource(resourceFolder: string, fileName: string, content: string): void {
    const projectRoot = process.cwd();
    const filePath = path.join(projectRoot, '../', resourceFolder, fileName);
    fs.writeFileSync(filePath, content, 'utf8');
  }

  static getReferenceJsonFileName(testResource: TestResource): string {
    return path.join(testResource.getDirectory(), testResource.getFile('.json'));
  }

  static getReferenceYamlFileName(testResource: TestResource): string {
    return path.join(testResource.getDirectory(), testResource.getFile('.yaml'));
  }

  static getOwnGeneratedYamlFileName(testResource: TestResource): string {
    return path.join(testResource.getDirectory(), testResource.getFile('-generated-ts-model-lib.yaml'));
  }

  static getOwnGeneratedJsonFileName(testResource: TestResource): string {
    return path.join(testResource.getDirectory(), testResource.getFile('-generated-ts-model-lib.json'));
  }

  static getJavaGeneratedYamlFileName(testResource: TestResource): string {
    return path.join(testResource.getDirectory(), testResource.getFile('-generated-java-artifact-lib.yaml'));
  }

  static getJavaGeneratedJsonFileName(testResource: TestResource): string {
    return path.join(testResource.getDirectory(), testResource.getFile('-generated-java-artifact-lib.json'));
  }

  static readTestJson(testResource: TestResource): string {
    return this.readTestResourceAsString(this.getReferenceJsonFileName(testResource));
  }

  static readReferenceYaml(testResource: TestResource): string {
    return this.readTestResourceAsString(this.getReferenceYamlFileName(testResource));
  }

  static writeSerializedYaml(testResource: TestResource, content: string): void {
    this.writeOutsideResource(testResource.getDirectoryFromCedarHomeRoot(), testResource.getFile('-generated-ts-model-lib.yaml'), content);
  }

  static writeSerializedJson(testResource: TestResource, content: string): void {
    this.writeOutsideResource(testResource.getDirectoryFromCedarHomeRoot(), testResource.getFile('-generated-ts-model-lib.json'), content);
  }

  static readTSLibYaml(testResource: TestResource): string {
    return this.readTestResourceAsString(this.getOwnGeneratedYamlFileName(testResource));
  }

  static readJavaLibYaml(testResource: TestResource): string {
    return this.readTestResourceAsString(this.getJavaGeneratedYamlFileName(testResource));
  }
}
