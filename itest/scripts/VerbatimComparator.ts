import { CedarArtifactType } from '../../src';
import { CompareFileSource } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileSource';
import { CompareFileFormat } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileFormat';
import { TestResource } from '../TestResource';
import { TestUtil } from '../TestUtil';

export class VerbatimComparator {
  compare(
    testNumbers: number[],
    artifactType: CedarArtifactType,
    leftSource: CompareFileSource,
    rightSource: CompareFileSource,
    format: CompareFileFormat,
  ) {
    for (const testNumber of testNumbers) {
      try {
        const testResource: TestResource = TestResource.artifact(testNumber, artifactType);
        const artifactLeftSource: string = TestUtil.readArtifact(testResource, leftSource, format);
        const artifactRightSource: string = TestUtil.readArtifact(testResource, rightSource, format);

        if (artifactLeftSource.trim() !== artifactRightSource.trim()) {
          console.log('DIFF FOUND: ' + testResource);
          // console.log('TypeScript:', ':' + artifactSourceTS + ':');
          // console.log('Java:', ':' + artifactSourceJava + ':');
        }
      } catch (error) {
        console.error(`Failed to process ${artifactType.getYamlValue()} ${testNumber}!`, error);
        //throw error;
      }
    }
  }
}
