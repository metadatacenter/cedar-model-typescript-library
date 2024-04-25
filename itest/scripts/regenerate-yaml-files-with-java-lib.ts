import { elementTestNumbers, fieldTestNumbers, templateTestNumbers } from '../resources/generatedTestCases';
import { TestResource } from '../TestResource';
import { TestUtil } from '../TestUtil';

import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const javaBaseCommand: string = `java -cp ${process.env.CEDAR_HOME}/cedar-artifact-library/target/cedar-artifact-library-${process.env.CEDAR_VERSION}-jar-with-dependencies.jar org.metadatacenter.artifacts.model.tools.ArtifactConvertor -yf`;

async function runJavaCommand(command: string) {
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

async function generateForTemplates() {
  for (const templateTestNumber of templateTestNumbers) {
    const testResource: TestResource = TestResource.template(templateTestNumber);
    const jsonInputPath: string = TestUtil.getReferenceJsonFileName(testResource);
    const yamlOutputPath: string = TestUtil.getJavaGeneratedYamlFileName(testResource);
    const command = `${javaBaseCommand} -tsf ${jsonInputPath} -f ${yamlOutputPath}`;
    console.log(command);
    await runJavaCommand(command);
  }
}

async function generateForElements() {
  for (const elementTestNumber of elementTestNumbers) {
    const testResource: TestResource = TestResource.element(elementTestNumber);
    const jsonInputPath: string = TestUtil.getReferenceJsonFileName(testResource);
    const yamlOutputPath: string = TestUtil.getJavaGeneratedYamlFileName(testResource);
    const command = `${javaBaseCommand} -esf ${jsonInputPath} -f ${yamlOutputPath}`;
    console.log(command);
    await runJavaCommand(command);
  }
}

async function generateForFields() {
  for (const fieldTestNumber of fieldTestNumbers) {
    const testResource: TestResource = TestResource.field(fieldTestNumber);
    const jsonInputPath: string = TestUtil.getReferenceJsonFileName(testResource);
    const yamlOutputPath: string = TestUtil.getJavaGeneratedYamlFileName(testResource);
    const command = `${javaBaseCommand} -fsf ${jsonInputPath} -f ${yamlOutputPath}`;
    console.log(command);
    await runJavaCommand(command);
  }
}

export async function generateYamlUsingJava() {
  await generateForTemplates();
  await generateForElements();
  await generateForFields();
}

generateYamlUsingJava().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
