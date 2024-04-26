import { elementTestNumbers, fieldTestNumbers, templateTestNumbers } from '../resources/generatedTestCases';
import { TestResource } from '../TestResource';
import { TestUtil } from '../TestUtil';

import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const javaBaseCommand: string = `java -cp ${process.env.CEDAR_HOME}/cedar-artifact-library/target/cedar-artifact-library-${process.env.CEDAR_VERSION}-jar-with-dependencies.jar org.metadatacenter.artifacts.model.tools.ArtifactConvertor -jf`;

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
    const jsonOutputPath: string = TestUtil.getJavaGeneratedJsonFileName(testResource);
    const command = `${javaBaseCommand} -tsf ${jsonInputPath} -f ${jsonOutputPath}`;
    console.log(command);
    await runJavaCommand(command);
  }
}

async function generateForElements() {
  for (const elementTestNumber of elementTestNumbers) {
    const testResource: TestResource = TestResource.element(elementTestNumber);
    const jsonInputPath: string = TestUtil.getReferenceJsonFileName(testResource);
    const jsonOutputPath: string = TestUtil.getJavaGeneratedJsonFileName(testResource);
    const command = `${javaBaseCommand} -esf ${jsonInputPath} -f ${jsonOutputPath}`;
    console.log(command);
    await runJavaCommand(command);
  }
}

async function generateForFields() {
  for (const fieldTestNumber of fieldTestNumbers) {
    const testResource: TestResource = TestResource.field(fieldTestNumber);
    const jsonInputPath: string = TestUtil.getReferenceJsonFileName(testResource);
    const jsonOutputPath: string = TestUtil.getJavaGeneratedJsonFileName(testResource);
    const command = `${javaBaseCommand} -fsf ${jsonInputPath} -f ${jsonOutputPath}`;
    console.log(command);
    await runJavaCommand(command);
  }
}

export async function generateJsonUsingJava() {
  await generateForFields();
  await generateForElements();
  await generateForTemplates();
}

generateJsonUsingJava().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
