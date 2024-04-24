import { elementTestNumbers, fieldTestNumbers, templateTestNumbers } from '../resources/generatedTestCases';
import { TestResource } from '../TestResource';
import { TestUtil } from '../TestUtil';

templateTestNumbers.forEach((templateTestNumber: number) => {
  try {
    const testResource: TestResource = TestResource.template(templateTestNumber);
    const artifactSourceTS: string = TestUtil.readTSLibYaml(testResource);
    const artifactSourceJava: string = TestUtil.readJavaLibYaml(testResource);

    if (artifactSourceTS.trim() !== artifactSourceJava.trim()) {
      console.log('DIFF:' + testResource);
      // console.log('TypeScript:', ':' + artifactSourceTS + ':');
      // console.log('Java:', ':' + artifactSourceJava + ':');
    }
  } catch (error) {
    console.error(`Failed to process template file: ${templateTestNumber}`, error);
    //throw error;
  }
});

elementTestNumbers.forEach((templateElementTestNumber: number) => {
  try {
    const testResource: TestResource = TestResource.element(templateElementTestNumber);
    const artifactSourceTS: string = TestUtil.readTSLibYaml(testResource);
    const artifactSourceJava: string = TestUtil.readJavaLibYaml(testResource);

    if (artifactSourceTS.trim() !== artifactSourceJava.trim()) {
      console.log('DIFF:' + testResource);
      // console.log('TypeScript:', artifactSourceTS);
      // console.log('Java:', artifactSourceJava);
    }
  } catch (error) {
    console.error(`Failed to process templateElement file: ${templateElementTestNumber}`, error);
    //throw error;
  }
});

fieldTestNumbers.forEach((templateFieldTestNumber: number) => {
  try {
    const testResource: TestResource = TestResource.field(templateFieldTestNumber);
    const artifactSourceTS: string = TestUtil.readTSLibYaml(testResource);
    const artifactSourceJava: string = TestUtil.readJavaLibYaml(testResource);

    if (artifactSourceTS.trim() !== artifactSourceJava.trim()) {
      console.log('DIFF:' + testResource);
      // console.log('TypeScript:', artifactSourceTS);
      // console.log('Java:', artifactSourceJava);
    }
  } catch (error) {
    console.error(`Failed to process templateField file: ${templateFieldTestNumber}`, error);
    //throw error;
  }
});
