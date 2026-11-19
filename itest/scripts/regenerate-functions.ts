import { promisify } from 'util';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ceeSuiteInstanceAsStored, ceeSuiteInstanceResources, ceeSuiteTemplateResources } from '../resources/ceeSuiteCases';
import {
  elementInstanceTestNumbers,
  elementTestNumbers,
  fieldTestNumbers,
  instanceTestNumbers,
  templateTestNumbers,
} from '../resources/generatedTestCases';
import { TestResource } from '../TestResource';
import { TestUtil } from '../TestUtil';
import {
  CedarJsonWriters,
  CedarWriters,
  CedarYamlWriters,
  JsonElementInstanceReader,
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

const javaArtifactLibraryJar =
  process.env.CEDAR_ARTIFACT_LIBRARY_JAR ??
  `${process.env.CEDAR_HOME}/cedar-artifact-library/target/cedar-artifact-library-${process.env.CEDAR_VERSION}-jar-with-dependencies.jar`;

export const javaBaseCommandForJson: string = `java -cp ${javaArtifactLibraryJar} org.metadatacenter.artifacts.model.tools.ArtifactConvertor -jif -jof`;

export const javaBaseCommandForYaml: string = `java -cp ${javaArtifactLibraryJar} org.metadatacenter.artifacts.model.tools.ArtifactConvertor -jif -yof -yq`;

export async function runJavaCommand(command: string) {
  try {
    const { stdout, stderr } = await execPromise(command);
    console.log('Output:', stdout);
    if (stderr) {
      console.error('Error:', stderr);
    }
  } catch (error) {
    console.error('Execution error:', error);
    throw error;
  }
}

/**
 * Render every CEE suite template and instance with the Java library, in one of the three forms the
 * numbered collections record. An instance is rendered as a host stores it (`ceeSuiteInstanceAsStored`).
 * A case the Java library refuses gets no fixture, and the parity scripts hold it to its listed reason.
 */
async function generateForCeeSuiteJava(form: 'json' | 'yaml' | 'compact') {
  const base = form === 'json' ? javaBaseCommandForJson : javaBaseCommandForYaml;
  const output = (resource: TestResource) =>
    form === 'json' ? TestUtil.getJavaGeneratedJsonFileName(resource) : TestUtil.getJavaGeneratedYamlFileName(resource, form === 'compact');
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'cee-suite-'));
  const jobs: Array<{ resource: TestResource; command: string }> = [];
  for (const resource of ceeSuiteTemplateResources()) {
    jobs.push({ resource, command: `${base} -tsf ${JSON.stringify(TestUtil.getReferenceJsonFileName(resource))}` });
  }
  for (const resource of ceeSuiteInstanceResources()) {
    const input = path.join(scratch, `${resource.getCaseId()}.json`);
    fs.writeFileSync(input, ceeSuiteInstanceAsStored(resource));
    jobs.push({ resource, command: `${base} -tif ${JSON.stringify(input)}` });
  }
  const refused: string[] = [];
  const run = async ({ resource, command }: { resource: TestResource; command: string }) => {
    const full = `${command} -f ${JSON.stringify(output(resource))}${form === 'compact' ? ' -cy' : ''}`;
    try {
      await execPromise(full);
    } catch {
      refused.push(resource.getCaseId());
    }
  };
  for (let i = 0; i < jobs.length; i += 6) await Promise.all(jobs.slice(i, i + 6).map(run));
  fs.rmSync(scratch, { recursive: true, force: true });
  console.log(`CEE suite (${form}): ${jobs.length - refused.length} rendered by Java, refused: ${refused.sort().join(', ') || 'none'}`);
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

/** Render every standalone element instance with the Java library, in one of the three forms. */
async function generateForElementInstancesJava(form: 'json' | 'yaml' | 'compact') {
  for (const number of elementInstanceTestNumbers) {
    const resource = TestResource.elementInstance(number);
    const output =
      form === 'json'
        ? TestUtil.getJavaGeneratedJsonFileName(resource)
        : TestUtil.getJavaGeneratedYamlFileName(resource, form === 'compact');
    const base = form === 'json' ? javaBaseCommandForJson : javaBaseCommandForYaml;
    const command = `${base} -eif ${TestUtil.getReferenceJsonFileName(resource)} -f ${output}${form === 'compact' ? ' -cy' : ''}`;
    console.log(command);
    await runJavaCommand(command);
  }
}

export async function generateAllJsonUsingJava() {
  await generateForFieldsJavaJson();
  await generateForElementsJavaJson();
  await generateForTemplatesJavaJson();
  await generateForInstancesJavaJson();
  await generateForElementInstancesJava('json');
  await generateForCeeSuiteJava('json');
}

/** The CEE suite's Java fixtures alone, in all three forms. */
export async function generateCeeSuiteUsingJava() {
  await generateForCeeSuiteJava('json');
  await generateForCeeSuiteJava('yaml');
  await generateForCeeSuiteJava('compact');
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
  await generateForElementInstancesJava('yaml');
  await generateForCeeSuiteJava('yaml');
}

export async function generateAllCompactYamlUsingJava() {
  await generateForFieldsJavaYaml(true);
  await generateForElementsJavaYaml(true);
  await generateForTemplatesJavaYaml(true);
  await generateForInstancesJavaYaml([], true);
  await generateForElementInstancesJava('compact');
  await generateForCeeSuiteJava('compact');
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

/**
 * Render every CEE suite template and instance with this library's strict readers and writers, in one
 * of the three forms the numbered collections record, from the same input the Java side reads. A case
 * the strict reader refuses gets no fixture, and the parity scripts hold it to its listed reason.
 */
function generateForCeeSuiteTS(form: 'json' | 'yaml' | 'compact', parts: Array<'template' | 'instance'> = ['template', 'instance']) {
  const refused: string[] = [];
  const write = (resource: TestResource, render: () => string) => {
    try {
      const rendered = render();
      if (form === 'json') TestUtil.writeSerializedJson(resource, rendered + '\n');
      else TestUtil.writeSerializedYaml(resource, rendered, form === 'compact');
    } catch {
      // A rendering left from before the reader refused the case would otherwise still be compared.
      fs.rmSync(
        form === 'json'
          ? TestUtil.getOwnGeneratedJsonFileName(resource)
          : TestUtil.getOwnGeneratedYamlFileName(resource, form === 'compact'),
        { force: true },
      );
      refused.push(resource.getCaseId());
    }
  };
  if (parts.includes('template')) {
    for (const resource of ceeSuiteTemplateResources()) {
      write(resource, () => {
        const template = JsonTemplateReader.getStrict().readFromString(TestUtil.readReferenceJson(resource)).template;
        return form === 'json'
          ? CedarWriters.json().getStrict().getTemplateWriter().getAsJsonString(template)
          : CedarWriters.yaml()
              .getStrict()
              .getTemplateWriter()
              .getAsYamlString(template, form === 'compact');
      });
    }
  }
  if (parts.includes('instance')) {
    for (const resource of ceeSuiteInstanceResources()) {
      write(resource, () => {
        const instance = JsonTemplateInstanceReader.getStrict().readFromString(ceeSuiteInstanceAsStored(resource)).instance;
        return form === 'json'
          ? CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonString(instance)
          : CedarWriters.yaml()
              .getStrict()
              .getTemplateInstanceWriter()
              .getAsYamlString(instance, form === 'compact');
      });
    }
  }
  if (refused.length > 0) console.log(`CEE suite (${form}): refused by the strict reader: ${refused.sort().join(', ')}`);
}

/** Render every standalone element instance with this library's strict reader and writers, in one of the three forms. */
function generateForElementInstancesTS(form: 'json' | 'yaml' | 'compact') {
  for (const number of elementInstanceTestNumbers) {
    const resource = TestResource.elementInstance(number);
    const instance = JsonElementInstanceReader.getStrict().readFromString(TestUtil.readReferenceJson(resource)).instance;
    if (form === 'json') {
      TestUtil.writeSerializedJson(resource, CedarWriters.json().getStrict().getElementInstanceWriter().getAsJsonString(instance) + '\n');
    } else {
      const yaml = CedarWriters.yaml()
        .getStrict()
        .getElementInstanceWriter()
        .getAsYamlString(instance, form === 'compact');
      TestUtil.writeSerializedYaml(resource, yaml, form === 'compact');
    }
  }
}

export function generateAllJsonUsingTypeScript() {
  generateForFieldsTSJson();
  generateForElementsTSJson();
  generateForTemplatesTSJson();
  generateForInstancesTSJson([]);
  generateForElementInstancesTS('json');
  generateForCeeSuiteTS('json');
}

export function generateInstanceJsonUsingTypeScript(instanceNumbers: number[] = []) {
  generateForInstancesTSJson(instanceNumbers);
}

// ------------------------------------------------------------------------------------------------

function generateForTemplatesTSYaml(isCompact: boolean) {
  for (const templateTestNumber of templateTestNumbers) {
    try {
      const testResource: TestResource = TestResource.template(templateTestNumber);
      const artifactSource: string = TestUtil.readReferenceJson(testResource);
      const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
      const jsonTemplateReaderResult: JsonTemplateReaderResult = reader.readFromString(artifactSource);

      const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
      const yamlWriter: YamlTemplateWriter = writers.getTemplateWriter();

      const stringified = yamlWriter.getAsYamlString(jsonTemplateReaderResult.template, isCompact);

      TestUtil.writeSerializedYaml(testResource, stringified, isCompact);
    } catch (error) {
      console.error(`Failed to process template file: ${templateTestNumber}`, error);
      throw error;
    }
  }
}

function generateForElementsTSYaml(isCompact: boolean) {
  for (const templateElementTestNumber of elementTestNumbers) {
    try {
      const testResource: TestResource = TestResource.element(templateElementTestNumber);
      const artifactSource: string = TestUtil.readReferenceJson(testResource);
      const reader: JsonTemplateElementReader = JsonTemplateElementReader.getStrict();
      const jsonTemplateElementReaderResult: JsonTemplateElementReaderResult = reader.readFromString(artifactSource);

      const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
      const yamlWriter: YamlTemplateElementWriter = writers.getTemplateElementWriter();

      const stringified = yamlWriter.getAsYamlString(jsonTemplateElementReaderResult.element, isCompact);

      TestUtil.writeSerializedYaml(testResource, stringified, isCompact);
    } catch (error) {
      console.error(`Failed to process templateElement file: ${templateElementTestNumber}`, error);
      throw error;
    }
  }
}

function generateForFieldsTSYaml(isCompact: boolean) {
  for (const templateFieldTestNumber of fieldTestNumbers) {
    try {
      const testResource: TestResource = TestResource.field(templateFieldTestNumber);
      const artifactSource: string = TestUtil.readReferenceJson(testResource);
      const reader: JsonTemplateFieldReader = JsonTemplateFieldReader.getStrict();
      const jsonTemplateFieldReaderResult: JsonTemplateFieldReaderResult = reader.readFromString(artifactSource);

      const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
      const yamlWriter: YamlTemplateFieldWriter = writers.getFieldWriterForField(jsonTemplateFieldReaderResult.field);

      const stringified = yamlWriter.getAsYamlString(jsonTemplateFieldReaderResult.field, isCompact);

      TestUtil.writeSerializedYaml(testResource, stringified, isCompact);
    } catch (error) {
      console.error(`Failed to process templateField file: ${templateFieldTestNumber}`, error);
      throw error;
    }
  }
}

function generateForInstancesTSYaml(instanceNumbers: number[], isCompact: boolean) {
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

      const stringified = yamlWriter.getAsYamlString(jsonTemplateInstanceReaderResult.instance, isCompact);

      TestUtil.writeSerializedYaml(testResource, stringified, isCompact);
    } catch (error) {
      console.error(`Failed to process templateInstance file: ${templateInstanceTestNumber}`, error);
      throw error;
    }
  }
}

export function generateAllYamlUsingTypeScript() {
  generateForFieldsTSYaml(false);
  generateForElementsTSYaml(false);
  generateForTemplatesTSYaml(false);
  generateForInstancesTSYaml([], false);
  generateForElementInstancesTS('yaml');
  generateForCeeSuiteTS('yaml');
}

export function generateAllCompactYamlUsingTypeScript() {
  generateForFieldsTSYaml(true);
  generateForElementsTSYaml(true);
  generateForTemplatesTSYaml(true);
  generateForInstancesTSYaml([], true);
  generateForElementInstancesTS('compact');
  generateForCeeSuiteTS('compact');
}

export function generateInstanceYamlUsingTypeScript(instanceNumbers: number[] = [], isCompact: boolean) {
  generateForInstancesTSYaml(instanceNumbers, isCompact);
  if (instanceNumbers.length === 0) generateForCeeSuiteTS(isCompact ? 'compact' : 'yaml', ['instance']);
}
