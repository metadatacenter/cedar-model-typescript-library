import { promisify } from 'util';
import { exec } from 'child_process';
import { elementTestNumbers, fieldTestNumbers, instanceTestNumbers, templateTestNumbers } from '../resources/generatedTestCases';
import { TestResource } from '../TestResource';
import { TestUtil } from '../TestUtil';
import {
  CedarJsonWriters,
  CedarWriters,
  CedarYamlWriters,
  JsonTemplateElementReader,
  JsonTemplateElementReaderResult,
  JsonTemplateElementWriter,
  JsonTemplateFieldReader,
  JsonTemplateFieldReaderResult,
  JsonTemplateFieldWriter,
  JsonTemplateInstanceReader,
  JsonTemplateInstanceReaderResult,
  JsonTemplateReader,
  JsonTemplateReaderResult,
  JsonTemplateWriter,
  YamlTemplateElementWriter,
  YamlTemplateFieldWriter,
  YamlTemplateWriter,
} from '../../src';
import { JsonTemplateInstanceWriter } from '../../src/org/metadatacenter/io/writer/json/JsonTemplateInstanceWriter';
import { YamlTemplateInstanceWriter } from '../../src/org/metadatacenter/io/writer/yaml/YamlTemplateInstanceWriter';

export const execPromise = promisify(exec);

export const javaBaseCommandForJson: string = `java -cp ${process.env.CEDAR_HOME}/cedar-artifact-library/target/cedar-artifact-library-${process.env.CEDAR_VERSION}-jar-with-dependencies.jar org.metadatacenter.artifacts.model.tools.ArtifactConvertor -jf`;

export const javaBaseCommandForYaml: string = `java -cp ${process.env.CEDAR_HOME}/cedar-artifact-library/target/cedar-artifact-library-${process.env.CEDAR_VERSION}-jar-with-dependencies.jar org.metadatacenter.artifacts.model.tools.ArtifactConvertor -yf -yq`;

export async function runJavaCommand(command: string) {
  try {
    const { stdout, stderr } = await execPromise(command);
    console.log('Output:', stdout);
    if (stderr) {
      console.error('Error:', stderr);
    }
  } catch (error) {
    console.error('Execution error:', error);
  }
}

async function generateForTemplatesJavaJson() {
  for (const templateTestNumber of templateTestNumbers) {
    const testResource: TestResource = TestResource.template(templateTestNumber);
    const jsonInputPath: string = TestUtil.getReferenceJsonFileName(testResource);
    const jsonOutputPath: string = TestUtil.getJavaGeneratedJsonFileName(testResource);
    const command = `${javaBaseCommandForJson} -tsf ${jsonInputPath} -f ${jsonOutputPath}`;
    console.log(command);
    await runJavaCommand(command);
  }
}

async function generateForElementsJavaJson() {
  for (const elementTestNumber of elementTestNumbers) {
    const testResource: TestResource = TestResource.element(elementTestNumber);
    const jsonInputPath: string = TestUtil.getReferenceJsonFileName(testResource);
    const jsonOutputPath: string = TestUtil.getJavaGeneratedJsonFileName(testResource);
    const command = `${javaBaseCommandForJson} -esf ${jsonInputPath} -f ${jsonOutputPath}`;
    console.log(command);
    await runJavaCommand(command);
  }
}

async function generateForFieldsJavaJson() {
  for (const fieldTestNumber of fieldTestNumbers) {
    const testResource: TestResource = TestResource.field(fieldTestNumber);
    const jsonInputPath: string = TestUtil.getReferenceJsonFileName(testResource);
    const jsonOutputPath: string = TestUtil.getJavaGeneratedJsonFileName(testResource);
    const command = `${javaBaseCommandForJson} -fsf ${jsonInputPath} -f ${jsonOutputPath}`;
    console.log(command);
    await runJavaCommand(command);
  }
}

async function generateForInstancesJavaJson(instanceNumbers: number[] = []) {
  if (instanceNumbers.length == 0) {
    instanceNumbers = instanceTestNumbers;
  }
  for (const fieldTestNumber of instanceNumbers) {
    const testResource: TestResource = TestResource.instance(fieldTestNumber);
    const jsonInputPath: string = TestUtil.getReferenceJsonFileName(testResource);
    const jsonOutputPath: string = TestUtil.getJavaGeneratedJsonFileName(testResource);
    const command = `${javaBaseCommandForJson} -tif ${jsonInputPath} -f ${jsonOutputPath}`;
    console.log(command);
    await runJavaCommand(command);
  }
}

export async function generateAllJsonUsingJava() {
  await generateForFieldsJavaJson();
  await generateForElementsJavaJson();
  await generateForTemplatesJavaJson();
  await generateForInstancesJavaJson();
}

export async function generateInstanceJsonUsingJava(instanceNumbers: number[] = []) {
  await generateForInstancesJavaJson(instanceNumbers);
}

// ------------------------------------------------------------------------------------------------

async function generateForTemplatesJavaYaml(isCompact: boolean) {
  for (const templateTestNumber of templateTestNumbers) {
    const testResource: TestResource = TestResource.template(templateTestNumber);
    const jsonInputPath: string = TestUtil.getReferenceJsonFileName(testResource);
    const yamlOutputPath: string = TestUtil.getJavaGeneratedYamlFileName(testResource, isCompact);
    let command = `${javaBaseCommandForYaml} -tsf ${jsonInputPath} -f ${yamlOutputPath}`;
    if (isCompact) {
      command += ' -cy';
    }
    console.log(command);
    await runJavaCommand(command);
  }
}

async function generateForElementsJavaYaml(isCompact: boolean) {
  for (const elementTestNumber of elementTestNumbers) {
    const testResource: TestResource = TestResource.element(elementTestNumber);
    const jsonInputPath: string = TestUtil.getReferenceJsonFileName(testResource);
    const yamlOutputPath: string = TestUtil.getJavaGeneratedYamlFileName(testResource, isCompact);
    let command = `${javaBaseCommandForYaml} -esf ${jsonInputPath} -f ${yamlOutputPath}`;
    if (isCompact) {
      command += ' -cy';
    }
    console.log(command);
    await runJavaCommand(command);
  }
}

async function generateForFieldsJavaYaml(isCompact: boolean) {
  for (const fieldTestNumber of fieldTestNumbers) {
    const testResource: TestResource = TestResource.field(fieldTestNumber);
    const jsonInputPath: string = TestUtil.getReferenceJsonFileName(testResource);
    const yamlOutputPath: string = TestUtil.getJavaGeneratedYamlFileName(testResource, isCompact);
    let command = `${javaBaseCommandForYaml} -fsf ${jsonInputPath} -f ${yamlOutputPath}`;
    if (isCompact) {
      command += ' -cy';
    }
    console.log(command);
    await runJavaCommand(command);
  }
}

async function generateForInstancesJavaYaml(instanceNumbers: number[] = [], isCompact: boolean) {
  if (instanceNumbers.length == 0) {
    instanceNumbers = instanceTestNumbers;
  }
  for (const fieldTestNumber of instanceNumbers) {
    const testResource: TestResource = TestResource.instance(fieldTestNumber);
    const jsonInputPath: string = TestUtil.getReferenceJsonFileName(testResource);
    const yamlOutputPath: string = TestUtil.getJavaGeneratedYamlFileName(testResource, isCompact);
    let command = `${javaBaseCommandForYaml} -tif ${jsonInputPath} -f ${yamlOutputPath}`;
    if (isCompact) {
      command += ' -cy';
    }
    console.log(command);
    await runJavaCommand(command);
  }
}

export async function generateAllYamlUsingJava() {
  await generateForFieldsJavaYaml(false);
  await generateForElementsJavaYaml(false);
  await generateForTemplatesJavaYaml(false);
  await generateForInstancesJavaYaml([], false);
}

export async function generateAllCompactYamlUsingJava() {
  await generateForFieldsJavaYaml(true);
  await generateForElementsJavaYaml(true);
  await generateForTemplatesJavaYaml(true);
  await generateForInstancesJavaYaml([], true);
}

export async function generateInstanceYamlUsingJava(instanceNumbers: number[] = [], isCompact: boolean) {
  await generateForInstancesJavaYaml(instanceNumbers, isCompact);
}

// ------------------------------------------------------------------------------------------------

function generateForTemplatesTSJson() {
  for (const templateTestNumber of templateTestNumbers) {
    try {
      const testResource: TestResource = TestResource.template(templateTestNumber);
      const artifactSource: string = TestUtil.readReferenceJson(testResource);
      const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
      const jsonTemplateReaderResult: JsonTemplateReaderResult = reader.readFromString(artifactSource);

      const writers: CedarJsonWriters = CedarWriters.json().getStrict();
      const jsonWriter: JsonTemplateWriter = writers.getTemplateWriter();

      const stringified = jsonWriter.getAsJsonString(jsonTemplateReaderResult.template);

      TestUtil.writeSerializedJson(testResource, stringified + '\n');
    } catch (error) {
      console.error(`Failed to process template file: ${templateTestNumber}`, error);
      throw error;
    }
  }
}

function generateForElementsTSJson() {
  for (const templateElementTestNumber of elementTestNumbers) {
    try {
      const testResource: TestResource = TestResource.element(templateElementTestNumber);
      const artifactSource: string = TestUtil.readReferenceJson(testResource);
      const reader: JsonTemplateElementReader = JsonTemplateElementReader.getStrict();
      const jsonTemplateElementReaderResult: JsonTemplateElementReaderResult = reader.readFromString(artifactSource);

      const writers: CedarJsonWriters = CedarWriters.json().getStrict();
      const jsonWriter: JsonTemplateElementWriter = writers.getTemplateElementWriter();

      const stringified = jsonWriter.getAsJsonString(jsonTemplateElementReaderResult.element);

      TestUtil.writeSerializedJson(testResource, stringified + '\n');
    } catch (error) {
      console.error(`Failed to process templateElement file: ${templateElementTestNumber}`, error);
      throw error;
    }
  }
}

function generateForFieldsTSJson() {
  for (const templateFieldTestNumber of fieldTestNumbers) {
    try {
      const testResource: TestResource = TestResource.field(templateFieldTestNumber);
      const artifactSource: string = TestUtil.readReferenceJson(testResource);
      const reader: JsonTemplateFieldReader = JsonTemplateFieldReader.getStrict();
      const jsonTemplateFieldReaderResult: JsonTemplateFieldReaderResult = reader.readFromString(artifactSource);

      const writers: CedarJsonWriters = CedarWriters.json().getStrict();
      const jsonWriter: JsonTemplateFieldWriter = writers.getFieldWriterForField(jsonTemplateFieldReaderResult.field);

      const stringified = jsonWriter.getAsJsonString(jsonTemplateFieldReaderResult.field);

      TestUtil.writeSerializedJson(testResource, stringified + '\n');
    } catch (error) {
      console.error(`Failed to process templateField file: ${templateFieldTestNumber}`, error);
      throw error;
    }
  }
}

function generateForInstancesTSJson(instanceNumbers: number[]) {
  if (instanceNumbers.length == 0) {
    instanceNumbers = instanceTestNumbers;
  }
  for (const templateInstanceTestNumber of instanceNumbers) {
    try {
      const testResource: TestResource = TestResource.instance(templateInstanceTestNumber);
      const artifactSource: string = TestUtil.readReferenceJson(testResource);
      const reader: JsonTemplateInstanceReader = JsonTemplateInstanceReader.getStrict();
      const jsonTemplateInstanceReaderResult: JsonTemplateInstanceReaderResult = reader.readFromString(artifactSource);

      const writers: CedarJsonWriters = CedarWriters.json().getStrict();
      const jsonWriter: JsonTemplateInstanceWriter = writers.getTemplateInstanceWriter();

      const stringified = jsonWriter.getAsJsonString(jsonTemplateInstanceReaderResult.instance);

      // console.log(jsonTemplateInstanceReaderResult.instance);

      TestUtil.writeSerializedJson(testResource, stringified + '\n');
    } catch (error) {
      console.error(`Failed to process templateInstance file: ${templateInstanceTestNumber}`, error);
      throw error;
    }
  }
}

export function generateAllJsonUsingTypeScript() {
  generateForFieldsTSJson();
  generateForElementsTSJson();
  generateForTemplatesTSJson();
  generateForInstancesTSJson([]);
}

export function generateInstanceJsonUsingTypeScript(instanceNumbers: number[] = []) {
  generateForInstancesTSJson(instanceNumbers);
}

// ------------------------------------------------------------------------------------------------

function generateForTemplatesTSYaml() {
  for (const templateTestNumber of templateTestNumbers) {
    try {
      const testResource: TestResource = TestResource.template(templateTestNumber);
      const artifactSource: string = TestUtil.readReferenceJson(testResource);
      const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
      const jsonTemplateReaderResult: JsonTemplateReaderResult = reader.readFromString(artifactSource);

      const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
      const yamlWriter: YamlTemplateWriter = writers.getTemplateWriter();

      const stringified = yamlWriter.getAsYamlString(jsonTemplateReaderResult.template);

      TestUtil.writeSerializedYaml(testResource, stringified);
    } catch (error) {
      console.error(`Failed to process template file: ${templateTestNumber}`, error);
      throw error;
    }
  }
}

function generateForElementsTSYaml() {
  for (const templateElementTestNumber of elementTestNumbers) {
    try {
      const testResource: TestResource = TestResource.element(templateElementTestNumber);
      const artifactSource: string = TestUtil.readReferenceJson(testResource);
      const reader: JsonTemplateElementReader = JsonTemplateElementReader.getStrict();
      const jsonTemplateElementReaderResult: JsonTemplateElementReaderResult = reader.readFromString(artifactSource);

      const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
      const yamlWriter: YamlTemplateElementWriter = writers.getTemplateElementWriter();

      const stringified = yamlWriter.getAsYamlString(jsonTemplateElementReaderResult.element);

      TestUtil.writeSerializedYaml(testResource, stringified);
    } catch (error) {
      console.error(`Failed to process templateElement file: ${templateElementTestNumber}`, error);
      throw error;
    }
  }
}

function generateForFieldsTSYaml() {
  for (const templateFieldTestNumber of fieldTestNumbers) {
    try {
      const testResource: TestResource = TestResource.field(templateFieldTestNumber);
      const artifactSource: string = TestUtil.readReferenceJson(testResource);
      const reader: JsonTemplateFieldReader = JsonTemplateFieldReader.getStrict();
      const jsonTemplateFieldReaderResult: JsonTemplateFieldReaderResult = reader.readFromString(artifactSource);

      const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
      const yamlWriter: YamlTemplateFieldWriter = writers.getFieldWriterForField(jsonTemplateFieldReaderResult.field);

      const stringified = yamlWriter.getAsYamlString(jsonTemplateFieldReaderResult.field);

      TestUtil.writeSerializedYaml(testResource, stringified);
    } catch (error) {
      console.error(`Failed to process templateField file: ${templateFieldTestNumber}`, error);
      throw error;
    }
  }
}

function generateForInstancesTSYaml(instanceNumbers: number[]) {
  if (instanceNumbers.length == 0) {
    instanceNumbers = instanceTestNumbers;
  }
  for (const templateInstanceTestNumber of instanceNumbers) {
    try {
      const testResource: TestResource = TestResource.instance(templateInstanceTestNumber);
      const artifactSource: string = TestUtil.readReferenceJson(testResource);
      const reader: JsonTemplateInstanceReader = JsonTemplateInstanceReader.getStrict();
      const jsonTemplateInstanceReaderResult: JsonTemplateInstanceReaderResult = reader.readFromString(artifactSource);

      const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
      const yamlWriter: YamlTemplateInstanceWriter = writers.getTemplateInstanceWriter();

      const stringified = yamlWriter.getAsYamlString(jsonTemplateInstanceReaderResult.instance);

      TestUtil.writeSerializedYaml(testResource, stringified);
    } catch (error) {
      console.error(`Failed to process templateInstance file: ${templateInstanceTestNumber}`, error);
      throw error;
    }
  }
}

export function generateAllYamlUsingTypeScript() {
  generateForFieldsTSYaml();
  generateForElementsTSYaml();
  generateForTemplatesTSYaml();
  generateForInstancesTSYaml([]);
}

export function generateInstanceYamlUsingTypeScript(instanceNumbers: number[] = []) {
  generateForInstancesTSYaml(instanceNumbers);
}
